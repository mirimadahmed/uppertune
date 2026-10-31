import { AlertCircle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type StageStatus = "pending" | "running" | "done" | "error";

export type StageView = {
  id: string;
  title: string;
  status: StageStatus;
  steps: { label: string; status: StageStatus }[];
  detail?: string;
};

function StatusIcon({ status, index }: { status: StageStatus; index: number }) {
  if (status === "done")
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-success-soft text-success">
        <Check className="size-4" />
      </span>
    );
  if (status === "running")
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Loader2 className="size-4 animate-spin" />
      </span>
    );
  if (status === "error")
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertCircle className="size-4" />
      </span>
    );
  return (
    <span className="flex size-8 items-center justify-center rounded-full border border-border bg-card font-mono text-[11px] text-muted-foreground">
      {index + 1}
    </span>
  );
}

const statusLabel: Record<StageStatus, string> = {
  pending: "Waiting",
  running: "In progress",
  done: "Complete",
  error: "Needs attention",
};

export function StageList({ stages }: { stages: StageView[] }) {
  return (
    <ol className="divide-y divide-border rounded-2xl border border-border bg-card" aria-live="polite">
      {stages.map((stage, index) => (
        <li key={stage.id} className="flex gap-4 p-5 sm:p-6">
          <StatusIcon status={stage.status} index={index} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                className={cn(
                  "text-[15px] font-semibold",
                  stage.status === "pending" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {stage.title}
              </h3>
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.14em]",
                  stage.status === "done" && "text-success",
                  stage.status === "running" && "text-primary",
                  stage.status === "error" && "text-danger",
                  stage.status === "pending" && "text-muted-foreground",
                )}
              >
                {statusLabel[stage.status]}
              </span>
            </div>
            {stage.status !== "pending" || stage.steps.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {stage.steps.map((step) => (
                  <li key={step.label} className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        step.status === "done" && "bg-success",
                        step.status === "running" && "animate-pulse bg-primary",
                        step.status === "error" && "bg-danger",
                        step.status === "pending" && "bg-border",
                      )}
                    />
                    <span className={step.status === "pending" ? "text-muted-foreground/70" : "text-muted-foreground"}>
                      {step.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {stage.detail ? (
              <p
                className={cn(
                  "mt-3 rounded-lg px-3 py-2 text-[13px] leading-relaxed",
                  stage.status === "error" ? "bg-danger-soft text-danger" : "bg-background text-foreground/80",
                )}
              >
                {stage.detail}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
