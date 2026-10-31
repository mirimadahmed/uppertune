"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace";
import type { StartupProfile } from "@/lib/types";

export type AnalysisResult = {
  mode: "demo" | "live";
  profile: StartupProfile;
  model?: string;
  url?: string;
  notes: string[];
  fundingRelevant: number;
  fundingReviewed: number;
  partners: number;
  people: number;
  actions: number;
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground/80">
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function ResultSummary({ result, onEnter }: { result: AnalysisResult; onEnter: () => void }) {
  const { hydrated, loadDemo, setAnalysis } = useWorkspace();
  const [entering, setEntering] = useState(false);
  const { profile } = result;
  const missing = profile.missingInformation.length;

  function enter() {
    setEntering(true);
    if (result.mode === "demo") {
      loadDemo();
    } else {
      setAnalysis({ profile, profileSource: "gemma", url: result.url, notes: result.notes });
    }
    onEnter();
  }

  const counts = [
    { label: "Relevant funding programmes", value: result.fundingRelevant, hint: `of ${result.fundingReviewed} reviewed` },
    { label: "Partnership opportunities", value: result.partners, hint: "potential and published" },
    { label: "People to connect with", value: result.people, hint: "verified people and suggested roles" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Company profile</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{profile.name}</h2>
          </div>
          <span
            className={
              result.mode === "demo"
                ? "rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning"
                : "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            }
          >
            {result.mode === "demo" ? "Illustrative demo startup" : `AI assessment · ${result.model ?? "Gemma 4"}`}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{profile.description}</p>
        {profile.industry.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.industry.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </div>
        ) : null}
        <dl className="mt-6 grid gap-5 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Markets">{profile.targetMarkets.length ? profile.targetMarkets.join(", ") : "Not stated"}</Field>
          <Field label="Core capabilities">
            {profile.capabilities.length ? profile.capabilities.slice(0, 4).join(", ") : "Not stated"}
          </Field>
          <Field label="Stage">{profile.stage ?? "Stage not stated"}</Field>
          <Field label="Missing information">
            {missing === 0 ? "None flagged" : `${missing} item${missing === 1 ? "" : "s"} to add`}
          </Field>
        </dl>
      </div>
      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
        {counts.map((count) => (
          <div key={count.label} className="bg-background px-6 py-5">
            <p className="text-3xl font-semibold tracking-tight text-foreground">{count.value}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{count.label}</p>
            <p className="text-xs text-muted-foreground">{count.hint}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 border-t border-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <p className="max-w-md text-sm text-muted-foreground">
          {result.mode === "demo"
            ? "Demo data is labelled throughout the workspace. Opportunity details link to their official sources."
            : "Review the profile in your workspace. Fit scores measure relevance, not the likelihood of acceptance."}
        </p>
        <Button size="lg" className="rounded-full px-6" onClick={enter} disabled={!hydrated || entering}>
          {entering ? <Loader2 className="size-4 animate-spin" /> : null}
          Enter your workspace
          {!entering ? <ArrowRight className="size-4" /> : null}
        </Button>
      </div>
    </div>
  );
}
