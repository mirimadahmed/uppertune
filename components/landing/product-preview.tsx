import { ArrowUpRight, Building2, CheckCircle2, CircleDashed, ListChecks, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-foreground/80",
        className,
      )}
    >
      {children}
    </span>
  );
}

function StatusBadge({ tone, children }: { tone: "success" | "warning" | "primary" | "teal"; children: React.ReactNode }) {
  const tones = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    primary: "bg-primary/10 text-primary",
    teal: "bg-accent-teal-soft text-accent-teal",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", tones[tone])}>
      {children}
    </span>
  );
}

const rows = [
  {
    icon: Building2,
    kind: "Partnership",
    title: "Agribusiness pilot partner",
    detail: "Crop-health monitoring pilot across selected estates",
    badge: <StatusBadge tone="teal">Potential partnership</StatusBadge>,
  },
  {
    icon: UserRound,
    kind: "People",
    title: "Programme manager, agritech accelerator",
    detail: "Guidance on commercialisation programme fit",
    badge: <StatusBadge tone="primary">Suggested role</StatusBadge>,
  },
  {
    icon: ListChecks,
    kind: "Action",
    title: "Confirm incorporation details",
    detail: "Required before eligibility can be completed",
    badge: <StatusBadge tone="warning">High priority</StatusBadge>,
  },
];

export function ProductPreview() {
  return (
    <div className="relative" aria-label="Illustrative preview of the UpperTune workspace">
      <div className="rounded-[20px] border border-border bg-card p-2 shadow-[0_24px_60px_-28px_rgba(23,32,51,0.28)]">
        <div className="flex items-center justify-between border-b border-border px-3 pb-2 pt-1">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Illustrative preview
          </span>
        </div>

        <div className="grid gap-2 p-2">
          {/* Company profile summary */}
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent-teal-soft font-mono text-[11px] font-semibold text-accent-teal">
                  CQ
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">CanopyIQ</p>
                  <p className="text-xs text-muted-foreground">Agricultural intelligence platform</p>
                </div>
              </div>
              <span className="rounded-full border border-dashed border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Illustrative demo startup
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip>AgriTech</Chip>
              <Chip>ClimateTech</Chip>
              <Chip>AI</Chip>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Markets</dt>
                <dd className="mt-0.5 text-foreground">Malaysia · Indonesia · Singapore</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Stage</dt>
                <dd className="mt-0.5 text-foreground">Early-stage (demo assumption)</dd>
              </div>
            </dl>
          </div>

          {/* Opportunity card */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Funding · Malaysia · Grant
                </p>
                <p className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
                  Technology commercialisation grant
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Satellite crop analytics aligns with the programme&apos;s commercialisation focus.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center">
                <div className="relative flex size-14 items-center justify-center">
                  <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${0.82 * 97.4} 97.4`}
                    />
                  </svg>
                  <span className="text-sm font-semibold text-foreground">82</span>
                </div>
                <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Fit</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <StatusBadge tone="success">
                <CheckCircle2 className="size-3" />
                Potentially eligible
              </StatusBadge>
              <StatusBadge tone="warning">
                <CircleDashed className="size-3" />
                Intake not confirmed
              </StatusBadge>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground">2 criteria need confirmation</span>
              <span className="inline-flex items-center gap-1 font-medium text-primary">
                View assessment <ArrowUpRight className="size-3" />
              </span>
            </div>
          </div>

          {/* Recommendation rows */}
          <div className="rounded-2xl border border-border bg-card">
            {rows.map((row, index) => (
              <div
                key={row.title}
                className={cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t border-border")}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                  <row.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{row.kind}</p>
                  <p className="truncate text-[13px] font-medium text-foreground">{row.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{row.detail}</p>
                </div>
                <div className="hidden shrink-0 sm:block">{row.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
