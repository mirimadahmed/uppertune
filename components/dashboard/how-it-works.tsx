"use client"

import { useEffect, useState } from "react"
import { FileSearch, Gauge, ListChecks, ScanText } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { icon: ScanText, title: "Your business profile", detail: "Understood from your website or description" },
  { icon: FileSearch, title: "Opportunity research", detail: "Curated, sourced ASEAN records" },
  { icon: Gauge, title: "Fit assessment", detail: "Transparent, rule-based scoring" },
  { icon: ListChecks, title: "Action roadmap", detail: "Prioritised next steps" },
]
const NUMERALS = ["I", "II", "III", "IV"]
const STEP_MS = 3200

export function HowItWorks() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section aria-label="How UpperTune works" className="relative overflow-hidden bg-primary px-6 py-10 text-primary-foreground lg:px-10">
      <div className="diagonal-lines pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
      <div className="relative">
        <span className="mb-8 inline-flex items-center gap-3 font-mono text-sm text-primary-foreground/50">
          <span className="h-px w-8 bg-primary-foreground/30" aria-hidden />
          How UpperTune works
        </span>
        <ol className="grid gap-px bg-primary-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-primary py-2 pr-6 sm:pl-6 sm:first:pl-0">
              <div className={cn("transition-opacity duration-500", active === i ? "opacity-100" : "opacity-45")}>
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl text-primary-foreground/30">{NUMERALS[i]}</span>
                <s.icon className="size-4 text-primary-foreground/50" aria-hidden />
              </div>
              <p className="mt-4 font-display text-2xl leading-tight">{s.title}</p>
              <p className="mt-1.5 text-sm text-primary-foreground/60">{s.detail}</p>
              </div>
              <div className="mt-5 h-px overflow-hidden bg-primary-foreground/15">
                {active === i ? (
                  <div
                    key={`run-${i}-${active}`}
                    className="progress-line h-full bg-primary-foreground"
                    style={{ ["--progress-duration" as string]: `${STEP_MS}ms` }}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
