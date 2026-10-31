"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, KeyRound, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StageList, type StageStatus, type StageView } from "@/components/analyze/stage-list";
import { ResultSummary, type AnalysisResult } from "@/components/analyze/result-summary";
import { normaliseWebsiteInput } from "@/components/landing/normalise-url";
import { UrlForm } from "@/components/landing/url-form";
import { demoStartup } from "@/data/demo-startup";
import { RELEVANCE_THRESHOLD, buildActionPlan, rankFunding, rankPartners, rankPeople } from "@/lib/matching";
import type { AnalyzeResponse, ExtractResponse, ExtractedPage, StartupProfile } from "@/lib/types";

const STAGE_MIN_MS = 700;

type RunInput = { mode: "demo" } | { mode: "live"; url: string };

type Outcome =
  | { kind: "running" }
  | { kind: "website_failed"; reason: string }
  | { kind: "ai_failed"; code: "no_api_key" | "model_error" | "invalid_input"; message: string }
  | { kind: "error"; message: string }
  | { kind: "complete"; result: AnalysisResult };

function initialStages(mode: RunInput["mode"]): StageView[] {
  return [
    {
      id: "understand",
      title: "Understanding your startup",
      status: "pending",
      steps: [
        {
          label:
            mode === "demo"
              ? "Loading the illustrative CanopyIQ demo profile (no website is fetched in demo mode)"
              : "Analysing your website content",
          status: "pending",
        },
      ],
    },
    {
      id: "profile",
      title: "Building your company profile",
      status: "pending",
      steps: [
        { label: "Extracting your products and capabilities", status: "pending" },
        { label: "Identifying relevant markets and industries", status: "pending" },
      ],
    },
    {
      id: "evaluate",
      title: "Evaluating relevant opportunities",
      status: "pending",
      steps: [
        { label: "Comparing your startup against available programmes", status: "pending" },
        { label: "Evaluating potential corporate partnerships", status: "pending" },
        { label: "Identifying people who can help", status: "pending" },
      ],
    },
    {
      id: "roadmap",
      title: "Preparing your growth roadmap",
      status: "pending",
      steps: [{ label: "Preparing your personalised recommendations", status: "pending" }],
    },
  ];
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

async function atLeast<T>(ms: number, signal: AbortSignal, op: () => T | Promise<T>): Promise<T> {
  const [value] = await Promise.all([Promise.resolve().then(op), sleep(ms, signal)]);
  return value;
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function AnalysisRunner({ input }: { input: RunInput }) {
  const router = useRouter();
  const [stages, setStages] = useState<StageView[]>(() => initialStages(input.mode));
  const [outcome, setOutcome] = useState<Outcome>({ kind: "running" });
  const [founderDescription, setFounderDescription] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const pageCache = useRef<{ url: string; page: ExtractedPage } | null>(null);

  const updateStage = useCallback(
    (id: string, patch: Partial<Omit<StageView, "steps">> & { stepStatus?: StageStatus | StageStatus[] }) => {
      setStages((prev) =>
        prev.map((stage) => {
          if (stage.id !== id) return stage;
          const { stepStatus, ...rest } = patch;
          const steps =
            stepStatus === undefined
              ? stage.steps
              : stage.steps.map((step, i) => ({
                  ...step,
                  status: Array.isArray(stepStatus) ? (stepStatus[i] ?? step.status) : stepStatus,
                }));
          return { ...stage, ...rest, steps };
        }),
      );
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const isDemo = input.mode === "demo";

    async function run() {
      setStages(initialStages(input.mode));
      setOutcome({ kind: "running" });
      let currentStage = "understand";
      try {
        // Stage 1 — understanding the startup
        updateStage("understand", { status: "running", stepStatus: "running" });
        let page: ExtractedPage | undefined;
        let profile: StartupProfile;
        let model: string | undefined;
        const notes: string[] = [];

        if (input.mode === "demo") {
          await sleep(STAGE_MIN_MS, signal);
          if (signal.aborted) return;
          updateStage("understand", {
            status: "done",
            stepStatus: "done",
            detail: "Loaded the illustrative CanopyIQ profile. CanopyIQ is a fictional startup used for the guided demo.",
          });
        } else if (founderDescription && !(pageCache.current?.url === input.url)) {
          await sleep(400, signal);
          if (signal.aborted) return;
          updateStage("understand", {
            status: "done",
            stepStatus: "done",
            detail: "Using the description you provided, because the website could not be accessed.",
          });
          notes.push("Website could not be accessed; profile based on founder description.");
        } else if (pageCache.current?.url === input.url) {
          page = pageCache.current.page;
          await sleep(300, signal);
          if (signal.aborted) return;
          updateStage("understand", {
            status: "done",
            stepStatus: "done",
            detail: `Using the website content read earlier from ${hostOf(page.url)}.`,
          });
        } else {
          const response = await atLeast(STAGE_MIN_MS, signal, async () => {
            const res = await fetch("/api/extract", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: input.url }),
              signal,
            });
            return (await res.json()) as ExtractResponse;
          });
          if (signal.aborted) return;
          if (!response.ok) {
            updateStage("understand", { status: "error", stepStatus: "error", detail: response.reason });
            setOutcome({ kind: "website_failed", reason: response.reason });
            return;
          }
          page = response.page;
          pageCache.current = { url: input.url, page };
          updateStage("understand", {
            status: "done",
            stepStatus: "done",
            detail: `Read ${page.title ? `“${page.title}”` : hostOf(page.url)}: ${page.headings.length} headings and ${page.text.length.toLocaleString()} characters of page text.`,
          });
        }

        // Stage 2 — company profile
        currentStage = "profile";
        updateStage("profile", { status: "running", stepStatus: "running" });
        if (input.mode === "demo") {
          profile = await atLeast(STAGE_MIN_MS, signal, () => demoStartup);
          if (signal.aborted) return;
          updateStage("profile", {
            status: "done",
            stepStatus: "done",
            detail: `Illustrative profile: ${profile.industry.join(" · ")}. Stage and markets are demo assumptions.`,
          });
        } else {
          const response = await atLeast(STAGE_MIN_MS, signal, async () => {
            const res = await fetch("/api/analyze-startup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: input.url, page, founderDescription }),
              signal,
            });
            try {
              return (await res.json()) as AnalyzeResponse;
            } catch {
              return {
                ok: false,
                code: "model_error",
                message: `The analysis service returned an unexpected response (HTTP ${res.status}).`,
              } satisfies AnalyzeResponse;
            }
          });
          if (signal.aborted) return;
          if (!response.ok) {
            updateStage("profile", {
              status: "error",
              stepStatus: "error",
              detail:
                response.code === "no_api_key"
                  ? "AI analysis is not configured on this server."
                  : response.message,
            });
            setOutcome({ kind: "ai_failed", code: response.code, message: response.message });
            return;
          }
          profile = response.profile;
          model = response.model;
          if (page && founderDescription) notes.push("Profile combines website content and the founder description.");
          notes.push(`Profile extracted by Gemma 4 (${response.model}) from the submitted content. Review it before relying on it.`);
          updateStage("profile", {
            status: "done",
            stepStatus: "done",
            detail: `Profile created with ${response.model}: ${profile.products.length} products, ${profile.capabilities.length} capabilities, ${profile.missingInformation.length} items still need your input.`,
          });
        }

        // Stage 3 — matching engine (runs locally on the curated dataset)
        currentStage = "evaluate";
        updateStage("evaluate", { status: "running", stepStatus: ["running", "pending", "pending"] });
        const subMin = Math.round(STAGE_MIN_MS / 3);
        const funding = await atLeast(subMin, signal, () => rankFunding(profile));
        if (signal.aborted) return;
        updateStage("evaluate", { stepStatus: ["done", "running", "pending"] });
        const partners = await atLeast(subMin, signal, () => rankPartners(profile));
        if (signal.aborted) return;
        updateStage("evaluate", { stepStatus: ["done", "done", "running"] });
        const people = await atLeast(subMin, signal, () => rankPeople(profile));
        if (signal.aborted) return;
        const relevantFunding = funding.filter((f) => f.fitScore >= RELEVANCE_THRESHOLD);
        const relevantPartners = partners.filter((p) => p.fitScore >= RELEVANCE_THRESHOLD);
        updateStage("evaluate", {
          status: "done",
          stepStatus: "done",
          detail: `${relevantFunding.length} relevant funding programmes out of ${funding.length} reviewed, ${relevantPartners.length} partnership opportunities and ${people.length} people to connect with.`,
        });

        // Stage 4 — roadmap
        currentStage = "roadmap";
        updateStage("roadmap", { status: "running", stepStatus: "running" });
        const tasks = await atLeast(STAGE_MIN_MS, signal, () =>
          buildActionPlan(profile, funding, partners, people, isDemo),
        );
        if (signal.aborted) return;
        updateStage("roadmap", {
          status: "done",
          stepStatus: "done",
          detail: `${tasks.length} prioritised actions across funding, partnerships and networking.`,
        });

        setOutcome({
          kind: "complete",
          result: {
            mode: input.mode,
            profile,
            model,
            url: input.mode === "live" ? input.url : undefined,
            notes,
            fundingRelevant: relevantFunding.length,
            fundingReviewed: funding.length,
            partners: relevantPartners.length,
            people: people.length,
            actions: tasks.length,
          },
        });
      } catch (err) {
        if (signal.aborted) return;
        const message = err instanceof Error ? err.message : "Something went wrong during the analysis.";
        updateStage(currentStage, { status: "error", stepStatus: "error", detail: message });
        setOutcome({ kind: "error", message });
      }
    }

    void run();
    return () => controller.abort();
  }, [input, founderDescription, attempt, updateStage]);

  function submitDescription(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (text.length < 30) {
      setDraftError("Add a little more detail (at least a couple of sentences) so the profile is useful.");
      return;
    }
    setDraftError(null);
    setFounderDescription(text);
    setAttempt((n) => n + 1);
  }

  const heading =
    input.mode === "demo" ? "Loading the guided demo" : `Analysing ${hostOf(input.url)}`;
  const subheading =
    input.mode === "demo"
      ? "The demo uses CanopyIQ, an illustrative startup, so you can explore the full workspace without an API key."
      : "UpperTune reads the page you submitted, builds a structured profile with Gemma 4 and compares it with curated ASEAN opportunities.";

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {input.mode === "demo" ? "Guided demo" : "Startup analysis"}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          {outcome.kind === "complete" ? "Your workspace is ready." : heading}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{subheading}</p>
      </div>

      <StageList stages={stages} />

      {outcome.kind === "website_failed" ? (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
              <TriangleAlert className="size-4" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">We couldn&apos;t access this website</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{outcome.reason}</p>
            </div>
          </div>
          <form onSubmit={submitDescription} className="mt-6" noValidate>
            <label htmlFor="founder-description" className="text-sm font-medium text-foreground">
              Describe your startup in a few sentences
            </label>
            <Textarea
              id="founder-description"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (draftError) setDraftError(null);
              }}
              rows={5}
              maxLength={2000}
              placeholder="What you build, who your customers are, which markets you serve and what you want to achieve next."
              aria-invalid={Boolean(draftError)}
              className="mt-2 rounded-xl bg-background text-[15px]"
            />
            {draftError ? <p className="mt-2 text-sm text-danger">{draftError}</p> : null}
            <p className="mt-2 text-xs text-muted-foreground">
              Only what you write here is used. Nothing is invented to fill the gaps.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="submit" className="rounded-full px-5">
                Continue
                <ArrowRight className="size-4" />
              </Button>
              <Button asChild variant="outline" className="rounded-full bg-card px-5">
                <Link href="/analyze?demo=1">Explore the demo instead</Link>
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {outcome.kind === "ai_failed" ? (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {outcome.code === "no_api_key" ? <KeyRound className="size-4" /> : <TriangleAlert className="size-4" />}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {outcome.code === "no_api_key"
                  ? "AI analysis isn't configured on this server"
                  : outcome.code === "invalid_input"
                    ? "We need a little more information"
                    : "The AI analysis didn't complete"}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {outcome.code === "no_api_key"
                  ? "Building a profile from a live website uses Gemma 4, which needs a GEMINI_API_KEY on the server. The guided demo shows the complete workspace without it."
                  : outcome.message}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {outcome.code === "no_api_key" ? (
              <>
                <Button asChild className="rounded-full px-5">
                  <Link href="/analyze?demo=1">
                    Explore the guided demo
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-full bg-card px-5" onClick={() => setAttempt((n) => n + 1)}>
                  <RefreshCw className="size-4" />
                  Try again
                </Button>
              </>
            ) : (
              <>
                <Button className="rounded-full px-5" onClick={() => setAttempt((n) => n + 1)}>
                  <RefreshCw className="size-4" />
                  Try again
                </Button>
                <Button asChild variant="outline" className="rounded-full bg-card px-5">
                  <Link href="/analyze?demo=1">Explore the guided demo</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {outcome.kind === "error" ? (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
          <p className="mt-1 text-sm text-muted-foreground">{outcome.message}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-full px-5" onClick={() => setAttempt((n) => n + 1)}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-card px-5">
              <Link href="/analyze?demo=1">Explore the guided demo</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {outcome.kind === "complete" ? (
        <ResultSummary result={outcome.result} onEnter={() => router.push("/app")} />
      ) : null}
    </div>
  );
}

function StartAnalysis({ invalidMessage }: { invalidMessage?: string }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Startup analysis</p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          Analyse your startup
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Enter your website to build a company profile and see the funding programmes, partnerships and people that
          fit your startup.
        </p>
      </div>
      {invalidMessage ? (
        <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">{invalidMessage}</p>
      ) : null}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <UrlForm autoFocus />
      </div>
    </div>
  );
}

export function AnalysisFlow() {
  const params = useSearchParams();
  const demo = ["1", "true", "yes"].includes((params.get("demo") ?? "").toLowerCase());
  const rawUrl = params.get("url")?.trim() ?? "";

  if (demo) return <AnalysisRunner key="demo" input={DEMO_INPUT} />;
  if (!rawUrl) return <StartAnalysis />;
  const normalised = normaliseWebsiteInput(rawUrl);
  if (!normalised.ok) {
    return <StartAnalysis invalidMessage={`We couldn't use “${rawUrl}”: ${normalised.error}`} />;
  }
  return <LiveRunner key={normalised.url} url={normalised.url} />;
}

const DEMO_INPUT: RunInput = { mode: "demo" };

function LiveRunner({ url }: { url: string }) {
  const [input] = useState<RunInput>(() => ({ mode: "live", url }));
  return <AnalysisRunner input={input} />;
}
