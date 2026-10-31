import type { GenerateKind, GenerateResponse, GeneratedDocument, StartupProfile } from "@/lib/types"

/** Client-side call to the server generation route (Gemma 4 with template fallback). */
export async function requestDocument(
  kind: GenerateKind,
  targetId: string,
  profile: StartupProfile,
): Promise<GeneratedDocument> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, targetId, profile }),
  })
  if (!res.ok) {
    let message = `Generation failed (${res.status})`
    try {
      const body = (await res.json()) as { error?: string; message?: string }
      message = body.error ?? body.message ?? message
    } catch {
      // keep default message
    }
    throw new Error(message)
  }
  const data = (await res.json()) as GenerateResponse
  return data.document
}

export function documentToText(doc: GeneratedDocument): string {
  if (doc.sections.length === 1 && doc.kind === "intro") return doc.sections[0].body
  return doc.sections.map((s) => `${s.heading}\n${s.body}`).join("\n\n")
}
