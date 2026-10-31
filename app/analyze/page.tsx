import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { AnalysisFlow } from "@/components/analyze/analysis-flow";
import { AnalyzeShell } from "@/components/analyze/analyze-shell";

export const metadata: Metadata = {
  title: "Startup analysis · UpperTune",
};

function Fallback() {
  return (
    <AnalyzeShell panel={null}>
      <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        Preparing the analysis…
      </div>
    </AnalyzeShell>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<Fallback />}>
      <AnalysisFlow />
    </Suspense>
  );
}
