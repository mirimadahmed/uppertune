import { NextResponse } from "next/server";
import { extractRequestSchema } from "@/lib/ai-schemas";
import type { ExtractResponse } from "@/lib/types";
import { extractWebsite } from "@/lib/website";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ExtractResponse>({ ok: false, reason: "The request body must be JSON." }, { status: 400 });
  }
  const parsed = extractRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ExtractResponse>(
      { ok: false, reason: "Please provide a website address to analyse." },
      { status: 400 },
    );
  }
  const result = await extractWebsite(parsed.data.url);
  return NextResponse.json<ExtractResponse>(result);
}
