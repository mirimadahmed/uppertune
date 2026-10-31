"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./analyze.module.css";

export type StageStatus = "pending" | "running" | "done" | "error";

export type StageView = {
  id: string;
  title: string;
  status: StageStatus;
  steps: { label: string; status: StageStatus }[];
  detail?: string;
};

/** Eases a displayed number towards its target (used for real values only). */
export function useCountTo(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const next = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      fromRef.current = next;
      setValue(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** Cycles through the sub-steps that are genuinely in progress; never marks anything done. */
function useRotatingLabel(labels: string[], active: boolean) {
  const [index, setIndex] = useState(0);
  const key = labels.join("|");
  useEffect(() => {
    setIndex(0);
    if (!active || key.split("|").length < 2) return;
    const id = setInterval(() => setIndex((i) => i + 1), 2600);
    return () => clearInterval(id);
  }, [key, active]);
  return labels.length ? labels[index % labels.length] : "";
}

function useElapsed(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    setSeconds(0);
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 250);
    return () => clearInterval(id);
  }, [active]);
  return seconds;
}

export function stageProgress(stages: StageView[]) {
  const total = stages.reduce((sum, stage) => {
    if (stage.status === "done") return sum + 1;
    if (!stage.steps.length) return sum;
    return sum + stage.steps.filter((step) => step.status === "done").length / stage.steps.length;
  }, 0);
  return Math.round((total / stages.length) * 100);
}

const statusText = "font-mono text-[11px] uppercase tracking-[0.14em]";

function StatusLabel({ status, elapsed }: { status: StageStatus; elapsed: number }) {
  if (status === "done")
    return (
      <span className={cn("inline-flex shrink-0 items-center gap-2 text-foreground", statusText)}>
        <span className="flex size-4 items-center justify-center bg-primary text-primary-foreground">
          <Check className="size-3" strokeWidth={3} />
        </span>
        Done
      </span>
    );
  if (status === "running")
    return (
      <span className={cn("inline-flex shrink-0 items-center gap-2 tabular-nums text-foreground", statusText)}>
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        Live · {String(elapsed).padStart(2, "0")}s
      </span>
    );
  if (status === "error")
    return (
      <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-danger", statusText)}>
        <AlertCircle className="size-3.5" />
        Needs attention
      </span>
    );
  return <span className={cn("shrink-0 text-muted-foreground", statusText)}>Waiting</span>;
}

function StageRow({ stage, index }: { stage: StageView; index: number }) {
  const running = stage.status === "running";
  const runningLabels = stage.steps.filter((step) => step.status === "running").map((step) => step.label);
  const rotating = useRotatingLabel(runningLabels, running);
  const elapsed = useElapsed(running);
  const line =
    stage.status === "done" || stage.status === "error"
      ? (stage.detail ?? stage.steps.map((step) => step.label).join(" · "))
      : running
        ? rotating || stage.steps[0]?.label
        : stage.steps[0]?.label;

  return (
    <li
      className={cn(
        "relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 border-b border-foreground/10 py-[clamp(0.75rem,1.9vh,1.3rem)] transition-opacity duration-500 sm:grid-cols-[3.5rem_minmax(0,1fr)]",
        stage.status === "pending" && "opacity-40",
      )}
    >
      <span
        className={cn(
          "font-display text-[clamp(1.6rem,3.5vh,2.4rem)] leading-none tabular-nums transition-colors duration-500",
          running ? "text-primary" : "text-foreground/30",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="truncate font-display text-[clamp(1.3rem,2.75vh,1.9rem)] leading-[1.1] tracking-tight text-foreground">
            {stage.title}
          </h3>
          <StatusLabel status={stage.status} elapsed={elapsed} />
        </div>
        <p
          key={`${stage.status}-${line}`}
          title={line}
          className={cn(
            "mt-1.5 text-[clamp(0.85rem,1.6vh,0.95rem)] leading-snug",
            stage.status === "error" ? "line-clamp-2 text-danger" : "truncate",
            stage.status === "done" ? "text-foreground/70" : stage.status !== "error" && "text-muted-foreground",
            stage.status !== "pending" && styles.swapIn,
          )}
        >
          {line}
        </p>
      </div>
      {running ? (
        <span aria-hidden className="absolute -bottom-px left-0 right-0 h-px overflow-hidden text-primary">
          <span className={styles.sweep} />
        </span>
      ) : null}
      {stage.status === "done" ? (
        <span aria-hidden className="absolute -bottom-px left-0 right-0 h-px overflow-hidden text-primary/50">
          <span className={styles.fill} />
        </span>
      ) : null}
    </li>
  );
}

export function StageList({ stages }: { stages: StageView[] }) {
  return (
    <ol className="border-t border-foreground/10" aria-live="polite">
      {stages.map((stage, index) => (
        <StageRow key={stage.id} stage={stage} index={index} />
      ))}
    </ol>
  );
}

export function OverallProgress({ stages, label }: { stages: StageView[]; label: string }) {
  const pct = stageProgress(stages);
  const shown = useCountTo(pct);
  const done = stages.filter((stage) => stage.status === "done").length;
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {label} · {done} of {stages.length} stages
        </span>
        <span className="font-display text-[clamp(2rem,4.2vh,2.75rem)] leading-none tabular-nums text-foreground">
          {shown}%
        </span>
      </div>
      <div className="relative mt-3 h-px bg-foreground/15">
        <div
          className="absolute -top-px left-0 h-[3px] bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
