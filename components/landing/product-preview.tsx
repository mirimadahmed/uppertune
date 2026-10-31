"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, Check, CircleDashed, ListChecks, UserRound } from "lucide-react";
import { useInView } from "@/components/landing/use-in-view";
import { cn } from "@/lib/utils";

const rows = [
  { icon: Building2, kind: "Partnership", title: "Agribusiness pilot partner", detail: "Crop-health monitoring pilot across selected estates", badge: "Potential partnership" },
  { icon: UserRound, kind: "People", title: "Programme manager, agritech accelerator", detail: "Guidance on commercialisation programme fit", badge: "Suggested role" },
  { icon: ListChecks, kind: "Action", title: "Confirm incorporation details", detail: "Required before eligibility can be completed", badge: "High priority" },
];

const label = "font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground";

export function ProductPreview({ className }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => setActive((prev) => (prev + 1) % rows.length), 2200);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <div
      ref={ref}
      role="figure"
      aria-label="Illustrative preview of the UpperTune workspace"
      className={cn("border border-foreground/15 bg-background", className)}
    >
      <div className="flex items-center justify-between gap-4 border-b border-foreground/10 px-5 py-3.5">
        <div className="flex items-center gap-4">
          <div className="flex gap-2" aria-hidden>
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
          </div>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">uppertune / workspace / canopyiq</span>
        </div>
        <span className={label}>Illustrative preview</span>
      </div>

      <div className="grid gap-px bg-foreground/10 lg:grid-cols-[1fr_1.1fr_1.15fr]">
        <div className="bg-background p-6 lg:p-8">
          <p className={label}>Company profile</p>
          <div className="mt-6 flex items-center gap-4">
            <span className="flex size-12 items-center justify-center border border-foreground/15 font-mono text-sm text-primary">CQ</span>
            <div>
              <p className="font-display text-3xl leading-none tracking-tight">CanopyIQ</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Agricultural intelligence platform</p>
            </div>
          </div>
          <span className="mt-5 inline-flex rounded-full border border-dashed border-foreground/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Illustrative demo startup
          </span>
          <div className="mt-5 flex flex-wrap gap-2">
            {["AgriTech", "ClimateTech", "AI"].map((tag) => (
              <span key={tag} className="border border-foreground/10 px-3 py-1 font-mono text-xs">{tag}</span>
            ))}
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-foreground/10 pt-5 text-sm">
            <div>
              <dt className={label}>Markets</dt>
              <dd className="mt-1">Malaysia · Indonesia · Singapore</dd>
            </div>
            <div>
              <dt className={label}>Stage</dt>
              <dd className="mt-1">Early-stage (demo assumption)</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col bg-background p-6 lg:p-8">
          <p className={label}>Funding · Malaysia · Grant</p>
          <p className="mt-6 font-display text-3xl leading-[1.05] tracking-tight">Technology commercialisation grant</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Satellite crop analytics aligns with the programme&apos;s commercialisation focus.
          </p>
          <div className="mt-6 flex items-end justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-6xl leading-none text-primary">82</span>
              <span className="font-mono text-xs text-muted-foreground">/ 100 fit</span>
            </div>
          </div>
          <div className="mt-3 h-px bg-foreground/10">
            <div
              className="h-full bg-primary transition-[width] duration-[1600ms] ease-out"
              style={{ width: inView ? "82%" : "0%" }}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              <Check className="size-3" /> Potentially eligible
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-foreground/30 px-3 py-1 text-xs">
              <CircleDashed className="size-3" /> Intake not confirmed
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-4 text-sm max-lg:mt-6">
            <span className="text-muted-foreground">2 criteria need confirmation</span>
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              View assessment <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>

        <div className="bg-background">
          <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4 lg:px-8">
            <span className={label}>Recommendations</span>
            <span className="font-mono text-xs text-muted-foreground">03</span>
          </div>
          {rows.map((row, index) => (
            <div
              key={row.title}
              className={cn(
                "flex items-start gap-4 border-b border-foreground/5 px-6 py-5 transition-colors duration-300 last:border-b-0 lg:px-8",
                active === index && "bg-primary/[0.04]",
              )}
            >
              <span
                className={cn(
                  "mt-1 flex size-9 shrink-0 items-center justify-center border transition-colors duration-300",
                  active === index ? "border-primary bg-primary text-primary-foreground" : "border-foreground/10",
                )}
              >
                <row.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={label}>{row.kind}</p>
                <p className="mt-1 text-[15px] font-medium leading-snug">{row.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{row.detail}</p>
                <span className="mt-2 inline-flex rounded-full border border-foreground/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {row.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 px-5 py-3.5 font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          CanopyIQ is a fictional startup used for the guided demo
        </span>
        <span>Verify programme details with the official source</span>
      </div>
    </div>
  );
}
