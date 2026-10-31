// Server-only Gemma 4 client. Never import this module from client components.
import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";

const DEFAULT_MODEL = "gemma-4-31b-it";
const CALL_TIMEOUT_MS = 45_000;

const SYSTEM_INSTRUCTION =
  "You are the analysis engine of UpperTune, a startup intelligence platform for the ASEAN ecosystem. " +
  "You write precise, factual, specific business analysis in British English. " +
  "You never invent facts, traction, customers, revenue, funding, people, contact details or deadlines; " +
  "when information is missing you say so or use a square-bracket placeholder. " +
  "You always answer with a single valid JSON object and nothing else: no markdown fences, no commentary.";

export type AiErrorCode = "no_api_key" | "model_error";

export class AiError extends Error {
  readonly code: AiErrorCode;
  constructor(code: AiErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AiError";
    this.code = code;
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getModelName(): string {
  return process.env.GEMMA_MODEL?.trim() || DEFAULT_MODEL;
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

function describeApiError(err: unknown, key: string): string {
  const status =
    typeof err === "object" && err !== null && "status" in err && typeof (err as { status: unknown }).status === "number"
      ? (err as { status: number }).status
      : undefined;
  const raw = err instanceof Error ? err.message : String(err);
  const detail = redact(raw, key).replace(/\s+/g, " ").slice(0, 240);
  if (status === 400 && /api key/i.test(raw)) return "The AI service rejected the configured API key.";
  if (status === 401 || status === 403) return "The AI service rejected the configured API key or model access.";
  if (status === 404) return `The configured model "${getModelName()}" was not found on the Gemini API.`;
  if (status === 429) return "The AI service is rate limiting requests. Please try again in a moment.";
  if (status !== undefined && status >= 500) return "The AI service is temporarily unavailable. Please try again.";
  return `The AI request failed: ${detail}`;
}

type CallOptions = { temperature?: number; maxOutputTokens?: number };

async function callModel(prompt: string, opts: CallOptions): Promise<string> {
  const { key, client } = getClient();
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new AiError("model_error", `The AI model did not respond within ${CALL_TIMEOUT_MS / 1000} seconds.`));
    }, CALL_TIMEOUT_MS);
  });

  try {
    const request = client.models.generateContent({
      model: getModelName(),
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: opts.temperature ?? 0.2,
        maxOutputTokens: opts.maxOutputTokens ?? 2048,
        abortSignal: controller.signal,
      },
    });
    const response = await Promise.race([request, timeout]);
    const text = response.text;
    if (!text || !text.trim()) {
      throw new AiError("model_error", "The AI model returned an empty response.");
    }
    return text;
  } catch (err) {
    if (err instanceof AiError) throw err;
    throw new AiError("model_error", describeApiError(err, key));
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
 * Throws AiError("no_api_key" | "model_error").
 */
export async function generateJson<T>(
  prompt: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  opts: CallOptions = {},
): Promise<T> {
  let problem = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const fullPrompt =
      attempt === 0
        ? prompt
        : `${prompt}\n\nYOUR PREVIOUS RESPONSE WAS REJECTED: ${problem}\nReturn ONLY one corrected JSON object that matches the required shape exactly. No markdown fences, no commentary.`;
    const text = await callModel(fullPrompt, opts);

    let data: unknown;
    try {
      data = parseJsonLoose(text);
    } catch (err) {
      problem = `It was not valid JSON (${err instanceof Error ? err.message : "parse error"}).`;
      continue;
    }

    const parsed = schema.safeParse(data);
    if (parsed.success) return parsed.data;
    problem = `It did not match the required shape: ${formatZodError(parsed.error)}.`;
  }
  throw new AiError("model_error", `The AI model returned a malformed response after one retry. ${problem}`);
}
