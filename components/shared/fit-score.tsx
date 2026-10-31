"use client"

import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FIT_SCORE_EXPLANATION } from "@/lib/matching"
import { cn } from "@/lib/utils"
import type { FitFactor } from "@/lib/types"

const SIZES = {
  sm: { box: 40, stroke: 3.5, text: "text-[13px]" },
  md: { box: 52, stroke: 4, text: "text-base" },
  lg: { box: 72, stroke: 5, text: "text-2xl" },
} as const

function scoreColor(score: number) {
  if (score >= 70) return "var(--primary)"
  if (score >= 45) return "var(--accent-teal)"
  return "#9aa3b5"
}

export function FitScore({
  score,
  size = "md",
  label = false,
  className,
}: {
  score: number
  size?: keyof typeof SIZES
  label?: boolean
  className?: string
}) {
  const s = SIZES[size]
  const r = (s.box - s.stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn("inline-flex cursor-help items-center gap-2.5", className)}
          aria-label={`Fit score ${clamped} out of 100`}
        >
          <div className="relative shrink-0" style={{ width: s.box, height: s.box }}>
            <svg width={s.box} height={s.box} className="-rotate-90">
              <circle cx={s.box / 2} cy={s.box / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={s.stroke} />
              <circle
                cx={s.box / 2}
                cy={s.box / 2}
                r={r}
                fill="none"
                stroke={scoreColor(clamped)}
                strokeWidth={s.stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - clamped / 100)}
                style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)" }}
              />
            </svg>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center font-semibold tabular-nums tracking-tight",
                s.text,
              )}
            >
              {clamped}
            </span>
          </div>
          {label ? (
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-medium">Fit score</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                Relevance, not acceptance odds <Info className="size-3" aria-hidden />
              </span>
            </span>
          ) : null}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 text-left leading-relaxed">
        {FIT_SCORE_EXPLANATION}
      </TooltipContent>
    </Tooltip>
  )
}

export function FitFactors({ factors, className }: { factors: FitFactor[]; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {factors.map((f) => {
        const pct = f.max > 0 ? Math.round((f.score / f.max) * 100) : 0
        return (
          <div key={f.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{f.label}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {Math.round(f.score)}/{f.max}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary/80"
                style={{ width: `${pct}%`, transition: "width 600ms ease" }}
              />
            </div>
            {f.detail ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.detail}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
