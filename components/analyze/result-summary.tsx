"use client";

import { useState } from "react";
import Link from "next/link";
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

export function CompletionActions({ result, onEnter }: { result: AnalysisResult; onEnter: () => void }) {
  const { hydrated, loadDemo, setAnalysis } = useWorkspace();
  const [entering, setEntering] = useState(false);

  function enter() {
    setEntering(true);
    if (result.mode === "demo") {
      loadDemo();
    } else {
      setAnalysis({ profile: result.profile, profileSource: "gemma", url: result.url, notes: result.notes });
    }
    onEnter();
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 animate-fade-up">
      <Button
        size="lg"
        onClick={enter}
        disabled={!hydrated || entering}
        className="group h-14 rounded-full bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
      >
        {entering ? <Loader2 className="size-4 animate-spin" /> : null}
        Enter your workspace
        {!entering ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /> : null}
      </Button>
      <Link href="/analyze" className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
        {result.mode === "demo" ? "Analyse your own startup" : "Analyse another startup"}
      </Link>
    </div>
  );
}
