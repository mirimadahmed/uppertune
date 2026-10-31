"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/lib/workspace"
import type { CorporatePartner } from "@/lib/types"

export function prepSteps(partner: CorporatePartner): { label: string; hint: string }[] {
  return [
    { label: "Research the organisation", hint: `Review ${partner.name}'s official website and the sources in section 8.` },
    { label: "Confirm the correct department", hint: `Validate who owns this decision — start with the ${partner.targetContactRole}.` },
    { label: "Prepare the tailored pitch", hint: "Review, edit and copy the pitch in section 5." },
    { label: "Prepare a product demonstration", hint: "Tailor a short demo to the suggested pilot scope." },
    { label: "Define measurable POC outcomes", hint: "Start from the proposed success metrics in section 3." },
    { label: "Send an introduction", hint: "Send it yourself. UpperTune never sends messages on your behalf." },
    { label: "Follow up", hint: "Plan a polite follow-up if you haven't heard back." },
  ]
}

export function prepKey(partnerId: string, index: number) {
  return `prep:${partnerId}:${index}`
}

export function usePrepProgress(partner: CorporatePartner) {
  const { state } = useWorkspace()
  const steps = prepSteps(partner)
  const done = steps.filter((_, i) => state.taskStatus[prepKey(partner.id, i)] === "completed").length
  return { done, total: steps.length }
}

export function PreparationChecklist({ partner }: { partner: CorporatePartner }) {
  const { state, setTaskStatus } = useWorkspace()
  const steps = prepSteps(partner)
  const { done, total } = usePrepProgress(partner)
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {done}/{total} complete
        </p>
      </div>
      <ul className="divide-y rounded-xl border">
        {steps.map((step, i) => {
          const key = prepKey(partner.id, i)
          const checked = state.taskStatus[key] === "completed"
          const inputId = `prep-${partner.id}-${i}`
          return (
            <li key={key}>
              <label
                htmlFor={inputId}
                className="flex cursor-pointer items-start gap-3.5 px-4 py-3.5 transition-colors hover:bg-secondary/40"
              >
                <Checkbox
                  id={inputId}
                  checked={checked}
                  onCheckedChange={(v) => setTaskStatus(key, v === true ? "completed" : "not_started")}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-medium transition-colors",
                      checked && "text-muted-foreground line-through decoration-foreground/30",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{step.hint}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
