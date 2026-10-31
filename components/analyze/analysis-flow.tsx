"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Globe, KeyRound, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AnalyzeEyebrow,
  AnalyzeShell,
  AnimatedTitle,
  PanelStatus,
  invertedPrimary,
  invertedSecondary,
} from "@/components/analyze/analyze-shell";
import { HowItWorksPanel, LivePanel, PanelProblem, type LiveData } from "@/components/analyze/live-panel";
import { OverallProgress, StageList, type StageStatus, type StageView } from "@/components/analyze/stage-list";
import { CompletionActions, type AnalysisResult } from "@/components/analyze/result-summary";
import { normaliseWebsiteInput } from "@/components/landing/normalise-url";
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
              ? "Loading the illustrative CanopyIQ demo profile"
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
  const [live, setLive] = useState<LiveData>({});
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
      setLive({});
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
            detail: "Loaded the illustrative CanopyIQ profile. No website is fetched in demo mode.",
          });
          setLive({ source: { label: hostOf(demoStartup.website ?? "canopyiq.example"), note: "Illustrative demo profile · no website fetched" } });
        } else if (founderDescription && !(pageCache.current?.url === input.url)) {
          await sleep(400, signal);
          if (signal.aborted) return;
          updateStage("understand", {
            status: "done",
            stepStatus: "done",
            detail: "Using the description you provided, because the website could not be accessed.",
          });
          setLive({ source: { label: "Founder description", note: "The website could not be accessed" } });
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
          setLive({ source: { label: hostOf(page.url), title: page.title || undefined, note: "Website content read earlier" } });
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
            detail: `Read ${hostOf(page.url)}: ${page.headings.length} headings and ${page.text.length.toLocaleString()} characters of page text.`,
          });
          setLive({
            source: {
              label: hostOf(page.url),
              title: page.title || undefined,
              note: `${page.headings.length} headings · ${page.text.length.toLocaleString()} characters read`,
            },
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
            detail: `${profile.industry.join(" · ")} · stage and markets are demo assumptions.`,
          });
          const demoProfile = profile;
          setLive((prev) => ({ ...prev, profile: demoProfile }));
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
            detail: `Built with ${response.model}: ${profile.products.length} products, ${profile.capabilities.length} capabilities, ${profile.missingInformation.length} items need your input.`,
          });
          const liveProfile = profile;
          setLive((prev) => ({ ...prev, profile: liveProfile, model: response.model }));
        }

        // Stage 3 — matching engine (runs locally on the curated dataset)
        currentStage = "evaluate";
        updateStage("evaluate", { status: "running", stepStatus: ["running", "pending", "pending"] });
        const subMin = Math.round(STAGE_MIN_MS / 3);
        const funding = await atLeast(subMin, signal, () => rankFunding(profile));
        if (signal.aborted) return;
        setLive((prev) => ({
          ...prev,
          funding: { relevant: funding.filter((f) => f.fitScore >= RELEVANCE_THRESHOLD).length, reviewed: funding.length },
        }));
        updateStage("evaluate", { stepStatus: ["done", "running", "pending"] });
        const partners = await atLeast(subMin, signal, () => rankPartners(profile));
        if (signal.aborted) return;
        setLive((prev) => ({ ...prev, partners: partners.filter((p) => p.fitScore >= RELEVANCE_THRESHOLD).length }));
        updateStage("evaluate", { stepStatus: ["done", "done", "running"] });
        const people = await atLeast(subMin, signal, () => rankPeople(profile));
        if (signal.aborted) return;
        const relevantFunding = funding.filter((f) => f.fitScore >= RELEVANCE_THRESHOLD);
        const relevantPartners = partners.filter((p) => p.fitScore >= RELEVANCE_THRESHOLD);
        setLive((prev) => ({ ...prev, people: people.length }));
        updateStage("evaluate", {
          status: "done",
          stepStatus: "done",
          detail: `${relevantFunding.length} relevant programmes of ${funding.length} reviewed, ${relevantPartners.length} partnerships and ${people.length} people to connect with.`,
        });

        // Stage 4 — roadmap
        currentStage = "roadmap";
        updateStage("roadmap", { status: "running", stepStatus: "running" });
        const tasks = await atLeast(STAGE_MIN_MS, signal, () =>
          buildActionPlan(profile, funding, partners, people, isDemo),
        );
        if (signal.aborted) return;
        setLive((prev) => ({ ...prev, actions: tasks.length }));
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

  const complete = outcome.kind === "complete";
  const problem = outcome.kind === "website_failed" || outcome.kind === "ai_failed" || outcome.kind === "error";
  const activeStage = stages.find((stage) => stage.status === "running")?.id;
  const title = complete ? "Your workspace is ready." : heading;
  const highlight = complete ? "ready." : input.mode === "demo" ? "demo" : hostOf(input.url);
  const meta = input.mode === "demo" ? "Demo data" : "Gemma 4";
  const sub = complete
    ? input.mode === "demo"
      ? "CanopyIQ is an illustrative startup. Demo data is labelled throughout the workspace and opportunity details link to their official sources."
      : "Review the profile in your workspace. Fit scores measure relevance, not the likelihood of acceptance."
    : subheading;

  let panel: React.ReactNode = <LivePanel data={live} activeStage={activeStage} />;
  if (outcome.kind === "website_failed") {
    panel = (
      <PanelProblem icon={<TriangleAlert className="size-4" />} title="We couldn't access this website">
        <p className="mt-3 text-[15px] leading-relaxed text-background/75">{outcome.reason}</p>
        <form onSubmit={submitDescription} className="mt-6" noValidate>
          <label htmlFor="founder-description" className="font-mono text-[11px] uppercase tracking-[0.14em] text-background/60">
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
            className="mt-3 min-h-32 rounded-[2px] border-background/30 bg-transparent text-[15px] text-background shadow-none placeholder:text-background/45 focus-visible:border-background/70 focus-visible:ring-0 dark:bg-transparent"
          />
          {draftError ? <p className="mt-2 text-sm text-background">{draftError}</p> : null}
          <p className="mt-2 text-xs text-background/60">Only what you write here is used. Nothing is invented to fill the gaps.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" className={invertedPrimary}>
              Continue
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button asChild variant="outline" className={invertedSecondary}>
              <Link href="/analyze?demo=1">Explore the demo instead</Link>
            </Button>
          </div>
        </form>
      </PanelProblem>
    );
  } else if (outcome.kind === "ai_failed") {
    panel = (
      <PanelProblem
        icon={outcome.code === "no_api_key" ? <KeyRound className="size-4" /> : <TriangleAlert className="size-4" />}
        title={
          outcome.code === "no_api_key"
            ? "AI analysis isn't configured on this server"
            : outcome.code === "invalid_input"
              ? "We need a little more information"
              : "The AI analysis didn't complete"
        }
      >
        <p className="mt-3 text-[15px] leading-relaxed text-background/75">
          {outcome.code === "no_api_key"
            ? "Building a profile from a live website uses Gemma 4, which needs a GEMINI_API_KEY on the server. The guided demo shows the complete workspace without it."
            : outcome.message}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {outcome.code === "no_api_key" ? (
            <>
              <Button asChild className={invertedPrimary}>
                <Link href="/analyze?demo=1">
                  Explore the guided demo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" className={invertedSecondary} onClick={() => setAttempt((n) => n + 1)}>
                <RefreshCw className="size-4" />
                Try again
              </Button>
            </>
          ) : (
            <>
              <Button className={invertedPrimary} onClick={() => setAttempt((n) => n + 1)}>
                <RefreshCw className="size-4" />
                Try again
              </Button>
              <Button asChild variant="outline" className={invertedSecondary}>
                <Link href="/analyze?demo=1">Explore the guided demo</Link>
              </Button>
            </>
          )}
        </div>
      </PanelProblem>
    );
  } else if (outcome.kind === "error") {
    panel = (
      <PanelProblem icon={<TriangleAlert className="size-4" />} title="Something went wrong">
        <p className="mt-3 text-[15px] leading-relaxed text-background/75">{outcome.message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className={invertedPrimary} onClick={() => setAttempt((n) => n + 1)}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className={invertedSecondary}>
            <Link href="/analyze?demo=1">Explore the guided demo</Link>
          </Button>
        </div>
      </PanelProblem>
    );
  }

  return (
    <AnalyzeShell
      panel={panel}
      panelLabel={problem ? "Action needed" : "Live profile"}
      panelStatus={
        <PanelStatus tone={complete ? "done" : problem ? "idle" : "live"} label={complete ? "Complete" : problem ? "Paused" : "Live"} meta={meta} />
      }
    >
      <AnalyzeEyebrow>
        {complete ? "Analysis complete" : problem ? "Needs your input" : input.mode === "demo" ? "Guided demo" : "Startup analysis"}
      </AnalyzeEyebrow>
      <AnimatedTitle key={title} text={title} highlight={highlight} />
      <p key={sub} className="mt-[clamp(1rem,2.4vh,1.5rem)] max-w-xl text-[clamp(0.95rem,1.9vh,1.15rem)] leading-relaxed text-muted-foreground animate-fade-up">
        {sub}
      </p>
      <div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex min-h-14 items-end">
        {outcome.kind === "complete" ? (
          <CompletionActions result={outcome.result} onEnter={() => router.push("/app")} />
        ) : (
          <OverallProgress stages={stages} label={problem ? "Paused" : "Overall progress"} />
        )}
      </div>
      <div className="mt-[clamp(1.25rem,3vh,2rem)]">
        <StageList stages={stages} />
      </div>
    </AnalyzeShell>
  );
}

function AnalyzeUrlForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = normaliseWebsiteInput(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setSubmitting(true);
    router.push(`/analyze?url=${encodeURIComponent(result.url)}`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-[clamp(1.5rem,4vh,2.5rem)] w-full max-w-xl animate-fade-up">
      <label htmlFor="analyze-url" className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Enter your startup website
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="analyze-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            autoFocus
            placeholder="https://yourstartup.com"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={Boolean(error)}
            className="h-14 rounded-[2px] border-foreground/20 bg-card pl-11 text-base shadow-none focus-visible:border-primary focus-visible:ring-0"
          />
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="group h-14 rounded-full bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
        >
          Analyse my startup
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href="/analyze?demo=1" className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline">
          Explore the guided demo
          <ArrowRight className="size-3.5" />
        </Link>
        <span className="text-sm text-muted-foreground">
          UpperTune analyses your business and maps opportunities that fit your startup.
        </span>
      </div>
    </form>
  );
}

function StartAnalysis({ invalidMessage }: { invalidMessage?: string }) {
  return (
    <AnalyzeShell panel={<HowItWorksPanel />} panelLabel="How it works" panelStatus={<PanelStatus tone="idle" label="Ready" meta="Gemma 4" />}>
      <AnalyzeEyebrow>Startup analysis</AnalyzeEyebrow>
      <AnimatedTitle text="Analyse your startup" highlight="startup" />
      <p className="mt-[clamp(1rem,2.4vh,1.5rem)] max-w-xl text-[clamp(0.95rem,1.9vh,1.15rem)] leading-relaxed text-muted-foreground animate-fade-up">
        Enter your website to build a company profile and see the funding programmes, partnerships and people that fit
        your startup.
      </p>
      {invalidMessage ? (
        <p className="mt-6 max-w-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning">{invalidMessage}</p>
      ) : null}
      <AnalyzeUrlForm />
    </AnalyzeShell>
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
