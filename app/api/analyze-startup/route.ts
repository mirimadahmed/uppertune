import { NextResponse } from "next/server";
import { analyzeRequestSchema, startupProfileSchema } from "@/lib/ai-schemas";
import { AiError, generateJsonWithModel, isAiConfigured } from "@/lib/gemma";
import { profileExtractionPrompt } from "@/lib/prompts";
import type { AnalyzeResponse, StartupProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<AnalyzeResponse>(
      { ok: false, code: "invalid_input", message: "The request body must be JSON." },
      { status: 400 },
    );
  }
  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<AnalyzeResponse>(
      {
        ok: false,
        code: "invalid_input",
        message: parsed.error.issues[0]?.message ?? "Provide website content or a short description of your startup.",
      },
      { status: 400 },
    );
  }

  if (!isAiConfigured()) {
    return NextResponse.json<AnalyzeResponse>({
      ok: false,
      code: "no_api_key",
      message:
        "AI analysis needs a GEMINI_API_KEY configured on the server. You can explore the guided demo without it.",
    });
  }

  const { url, page, founderDescription } = parsed.data;
  try {
    const { data: result, model } = await generateJsonWithModel(
      profileExtractionPrompt({ url, page, founderDescription }),
      startupProfileSchema,
      { temperature: 0.1, maxOutputTokens: 8192 },
    );
    const website = page?.url || url || result.website;
    const profile: StartupProfile = { ...result, website: website || undefined };
    return NextResponse.json<AnalyzeResponse>({ ok: true, profile, source: "gemma", model });
  } catch (err) {
    const message =
      err instanceof AiError
        ? err.message
        : "The AI analysis failed unexpectedly. Please try again or explore the guided demo.";
    if (err instanceof AiError && err.code === "no_api_key") {
      return NextResponse.json<AnalyzeResponse>({ ok: false, code: "no_api_key", message });
    }
    console.error("[analyze-startup] model error:", message);
    return NextResponse.json<AnalyzeResponse>({ ok: false, code: "model_error", message });
  }
}
