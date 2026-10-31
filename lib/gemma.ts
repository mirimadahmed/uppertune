// Server-only Gemma 4 client. Never import this module from client components.
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { z } from "zod";

// gemma-4-26b-a4b-it answered in ~5s during testing; gemma-4-31b-it took 60-90s and intermittently
// returned 500s on the Gemini API, so it is used as the automatic fallback rather than the default.
const DEFAULT_MODEL = "gemma-4-26b-a4b-it";
const ALTERNATE_MODEL = "gemma-4-31b-it";
const CALL_TIMEOUT_MS = 40_000;
/** Quick same-model retries for intermittent 5xx/429 responses before switching models. */
const SAME_MODEL_RETRIES = 2;

/**
 * Gemma 4 thinking is toggled with thinkingLevel: "minimal" (off) or "high" (on). Thinking on long extraction
 * prompts consumed the whole output budget (8k+ thought tokens, ~3 minutes), so it is off by default.
 */
function thinkingLevel(): ThinkingLevel {
  return process.env.GEMMA_THINKING?.trim().toLowerCase() === "high" ? ThinkingLevel.HIGH : ThinkingLevel.MINIMAL;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SYSTEM_INSTRUCTION =
  "You are the analysis engine of UpperTune, a startup intelligence platform for the ASEAN ecosystem. " +
  "You write precise, factual, specific business analysis in British English. " +
  "You never invent facts, traction, customers, revenue, funding, people, contact details or deadlines; " +
  "when information is missing you say so or use a square-bracket placeholder. " +
  "You always answer with a single valid JSON object and nothing else: no markdown fences, no commentary.";

export type AiErrorCode = "no_api_key" | "model_error";

export class AiError extends Error {
  readonly code: AiErrorCode;
  /** Timeouts, 5xx, 404 and 429 are worth retrying on the fallback model; key/permission errors are not. */
  readonly transient: boolean;
  /** true when the call hit our timeout (retrying the same model is pointless). */
  readonly timedOut: boolean;
  constructor(code: AiErrorCode, message: string, options?: { cause?: unknown; transient?: boolean; timedOut?: boolean }) {
    super(message, options);
    this.name = "AiError";
    this.code = code;
    this.transient = options?.transient ?? false;
    this.timedOut = options?.timedOut ?? false;
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getModelName(): string {
  return process.env.GEMMA_MODEL?.trim() || DEFAULT_MODEL;
}

/** Primary model first, then one fallback Gemma model (override with GEMMA_FALLBACK_MODEL, or "none" to disable). */
export function getModelChain(): string[] {
  const primary = getModelName();
  const configured = process.env.GEMMA_FALLBACK_MODEL?.trim();
  if (configured === "none") return [primary];
  const fallback = configured || (primary === DEFAULT_MODEL ? ALTERNATE_MODEL : DEFAULT_MODEL);
  return fallback && fallback !== primary ? [primary, fallback] : [primary];
}

let cachedClient: { key: string; client: GoogleGenAI } | null = null;

function getClient(): { key: string; client: GoogleGenAI } {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new AiError("no_api_key", "GEMINI_API_KEY is not configured on the server.");
  }
  if (!cachedClient || cachedClient.key !== key) {
    cachedClient = { key, client: new GoogleGenAI({ apiKey: key }) };
  }
  return cachedClient;
}

function redact(message: string, key: string): string {
  return key ? message.split(key).join("[redacted]") : message;
}

function apiStatus(err: unknown): number | undefined {
  return typeof err === "object" && err !== null && "status" in err && typeof (err as { status: unknown }).status === "number"
    ? (err as { status: number }).status
    : undefined;
}

function describeApiError(err: unknown, key: string, model: string): string {
  const status = apiStatus(err);
  const raw = err instanceof Error ? err.message : String(err);
  const detail = redact(raw, key).replace(/\s+/g, " ").slice(0, 240);
  if (status === 400 && /api key/i.test(raw)) return "The AI service rejected the configured API key.";
  if (status === 401 || status === 403) return "The AI service rejected the configured API key or model access.";
  if (status === 404) return `The configured model "${model}" was not found on the Gemini API.`;
  if (status === 429) return "The AI service is rate limiting requests. Please try again in a moment.";
  if (status !== undefined && status >= 500) return "The AI service is temporarily unavailable. Please try again.";
  return `The AI request failed: ${detail}`;
}

type CallOptions = { temperature?: number; maxOutputTokens?: number };

async function callModel(prompt: string, opts: CallOptions, model: string): Promise<string> {
  const { key, client } = getClient();
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(
        new AiError("model_error", `The AI model did not respond within ${CALL_TIMEOUT_MS / 1000} seconds.`, {
          transient: true,
          timedOut: true,
        }),
      );
    }, CALL_TIMEOUT_MS);
  });

  try {
    const request = client.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: opts.temperature ?? 0.2,
        maxOutputTokens: opts.maxOutputTokens ?? 8192,
        thinkingConfig: { thinkingLevel: thinkingLevel() },
        abortSignal: controller.signal,
      },
    });
    const response = await Promise.race([request, timeout]);
    const text = response.text;
    if (!text || !text.trim()) {
      throw new AiError("model_error", "The AI model returned an empty response.", { transient: true });
    }
    return text;
  } catch (err) {
    if (err instanceof AiError) throw err;
    const status = apiStatus(err);
    const transient = status === undefined || status >= 500 || status === 404 || status === 429;
    throw new AiError("model_error", describeApiError(err, key, model), { transient });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Extracts the first JSON object from model text, tolerating code fences, leading prose and trailing commas. */
export function parseJsonLoose(text: string): unknown {
  let candidate = text.trim();
  const fenced = candidate.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (fenced) candidate = fenced[1].trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("no JSON object found in the response");
  }
  candidate = candidate.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return JSON.parse(candidate.replace(/,\s*([}\]])/g, "$1"));
  }
}

function formatZodError(error: z.ZodError): string {
  return error.issues
    .slice(0, 8)
    .map((issue) => `${issue.path.length ? issue.path.join(".") : "(root)"}: ${issue.message}`)
    .join("; ");
}

/**
 * Calls Gemma with a JSON-only prompt, validates with Zod and retries once with the validation error appended.
 * Transient failures (timeout, 5xx, 404, 429) move to the fallback Gemma model. Returns the model that answered.
 * Throws AiError("no_api_key" | "model_error").
 */
export async function generateJsonWithModel<T>(
  prompt: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  opts: CallOptions = {},
): Promise<{ data: T; model: string }> {
  const chain = getModelChain();
  let modelIndex = 0;
  let problem = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const fullPrompt =
      attempt === 0
        ? prompt
        : `${prompt}\n\nYOUR PREVIOUS RESPONSE WAS REJECTED: ${problem}\nReturn ONLY one corrected JSON object that matches the required shape exactly. No markdown fences, no commentary.`;

    let text: string;
    let sameModelRetries = 0;
    for (;;) {
      const model = chain[modelIndex];
      try {
        text = await callModel(fullPrompt, opts, model);
        break;
      } catch (err) {
        if (!(err instanceof AiError) || !err.transient) throw err;
        if (!err.timedOut && sameModelRetries < SAME_MODEL_RETRIES) {
          sameModelRetries++;
          console.warn(`[gemma] ${model} failed (${err.message}); retry ${sameModelRetries}/${SAME_MODEL_RETRIES}`);
          await sleep(700 * sameModelRetries);
          continue;
        }
        if (modelIndex < chain.length - 1) {
          console.warn(`[gemma] ${model} failed (${err.message}); switching to ${chain[modelIndex + 1]}`);
          modelIndex++;
          sameModelRetries = 0;
          continue;
        }
        throw err;
      }
    }

    let data: unknown;
    try {
      data = parseJsonLoose(text);
    } catch (err) {
      problem = `It was not valid JSON (${err instanceof Error ? err.message : "parse error"}).`;
      continue;
    }

    const parsed = schema.safeParse(data);
    if (parsed.success) return { data: parsed.data, model: chain[modelIndex] };
    problem = `It did not match the required shape: ${formatZodError(parsed.error)}.`;
  }
  throw new AiError("model_error", `The AI model returned a malformed response after one retry. ${problem}`);
}

export async function generateJson<T>(
  prompt: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  opts: CallOptions = {},
): Promise<T> {
  return (await generateJsonWithModel(prompt, schema, opts)).data;
}
