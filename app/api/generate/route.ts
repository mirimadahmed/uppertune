import { NextResponse } from "next/server";
import { generateRequestSchema, sectionsSchemaFor } from "@/lib/ai-schemas";
import { AiError, generateJsonWithModel, isAiConfigured } from "@/lib/gemma";
import { assessFunding } from "@/lib/matching";
import { REQUIRED_HEADINGS, introPrompt, pitchPrompt, pocPrompt, strategyPrompt } from "@/lib/prompts";
import { resolveTarget, templateDocument, type GenerationTarget } from "@/lib/templates";
import type { GenerateKind, GenerateResponse, StartupProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function buildPrompt(kind: GenerateKind, target: GenerationTarget, profile: StartupProfile) {
  switch (target.kind) {
    case "strategy":
      return {
        prompt: strategyPrompt(profile, target.opportunity, assessFunding(profile, target.opportunity)),
        headings: REQUIRED_HEADINGS.strategy(),
      };
    case "intro":
      return { prompt: introPrompt(profile, target.person), headings: REQUIRED_HEADINGS.intro() };
    default:
      return kind === "poc"
        ? { prompt: pocPrompt(profile, target.partner), headings: REQUIRED_HEADINGS.poc() }
        : { prompt: pitchPrompt(profile, target.partner), headings: REQUIRED_HEADINGS.pitch(target.partner.name) };
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body must be JSON." }, { status: 400 });
  }
  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: `Invalid request: ${issue ? `${issue.path.join(".") || "body"} ${issue.message}` : "unknown error"}` },
      { status: 400 },
    );
  }

  const { kind, targetId } = parsed.data;
  const profile: StartupProfile = parsed.data.profile;
  const target = resolveTarget(kind, targetId);
  if (!target) {
    return NextResponse.json({ error: `No ${kind === "strategy" ? "funding programme" : kind === "intro" ? "person" : "partner"} found with id "${targetId}".` }, { status: 404 });
  }

  if (isAiConfigured()) {
    try {
      const { prompt, headings } = buildPrompt(kind, target, profile);
      const { data: result, model } = await generateJsonWithModel(prompt, sectionsSchemaFor(headings), {
        temperature: 0.4,
        maxOutputTokens: 6144,
      });
      return NextResponse.json<GenerateResponse>({
        document: {
          kind,
          targetId,
          title: result.title,
          sections: result.sections,
          source: "gemma",
          model,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      const reason = err instanceof AiError ? err.message : "Unexpected generation error.";
      console.error(`[generate] ${kind}:${targetId} falling back to template:`, reason);
      const fallback = templateDocument(kind, targetId, profile);
      return NextResponse.json<GenerateResponse>({
        document: {
          ...fallback,
          note: "Demo intelligence — generated from UpperTune templates because the AI model request failed. Try regenerating in a moment.",
        },
      });
    }
  }

  return NextResponse.json<GenerateResponse>({ document: templateDocument(kind, targetId, profile) });
}
