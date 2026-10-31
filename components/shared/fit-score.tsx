"use client"

import { useEffect, useState } from "react"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FIT_SCORE_EXPLANATION } from "@/lib/matching"
import { cn } from "@/lib/utils"
import type { FitFactor } from "@/lib/types"

const SIZES = {
  sm: { box: 40, stroke: 2.5, text: "text-[17px]" },
  md: { box: 56, stroke: 3, text: "text-[24px]" },
  lg: { box: 80, stroke: 3.5, text: "text-[34px]" },
} as const

/** Monochrome scale: ink for strong fit, mid-grey for moderate, light grey for weak. */
function scoreColor(score: number) {
  if (score >= 70) return "var(--primary)"
  if (score >= 45) return "color-mix(in oklch, var(--primary) 50%, var(--background))"
  return "var(--chart-4)"
}

/** Starts at 0 and settles on the target after mount so gauges and bars draw in. */
function useDrawIn(target: number) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setValue(target))
    return () => window.cancelAnimationFrame(id)
  }, [target])
  return value
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
  const drawn = useDrawIn(clamped)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn("inline-flex cursor-help items-center gap-2.5", className)}
          aria-label={`Fit score ${clamped} out of 100`}
        >
          <div className="relative shrink-0" style={{ width: s.box, height: s.box }}>
            <svg width={s.box} height={s.box} className="-rotate-90">
              <circle
                cx={s.box / 2}
                cy={s.box / 2}
                r={r}
                fill="none"
                stroke="color-mix(in oklch, var(--foreground) 9%, transparent)"
                strokeWidth={s.stroke}
              />
              <circle
                cx={s.box / 2}
                cy={s.box / 2}
                r={r}
                fill="none"
                stroke={scoreColor(clamped)}
                strokeWidth={s.stroke}
                strokeLinecap="butt"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - drawn / 100)}
                style={{ transition: "stroke-dashoffset 1200ms cubic-bezier(0.22,1,0.36,1)" }}
              />
            </svg>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center pt-px font-display leading-none tabular-nums",
                s.text,
              )}
            >
              {clamped}
            </span>
          </div>
          {label ? (
            <span className="flex flex-col leading-tight">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em]">Fit score</span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
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
  const ready = useDrawIn(1) === 1
  return (
    <div className={cn("space-y-4", className)}>
      {factors.map((f, i) => {
        const pct = f.max > 0 ? Math.round((f.score / f.max) * 100) : 0
        return (
          <div key={f.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{f.label}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {Math.round(f.score)}/{f.max}
              </span>
            </div>
            <div className="h-[3px] overflow-hidden bg-foreground/10">
              <div
                className="h-full bg-primary"
                style={{
                  width: ready ? `${pct}%` : "0%",
                  transition: `width 1100ms cubic-bezier(0.22,1,0.36,1) ${i * 120}ms`,
                }}
              />
            </div>
            {f.detail ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.detail}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
