import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AnalysisFlow } from "@/components/analyze/analysis-flow";
import { Wordmark } from "@/components/landing/logo";

export const metadata: Metadata = {
  title: "Startup analysis · UpperTune",
};

function Fallback() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin text-primary" />
      Preparing the analysis…
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Wordmark />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
        <Suspense fallback={<Fallback />}>
          <AnalysisFlow />
        </Suspense>
      </main>
    </div>
  );
}
