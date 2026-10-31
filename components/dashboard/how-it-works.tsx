import { ChevronRight, FileSearch, Gauge, ListChecks, ScanText } from "lucide-react"

const STEPS = [
  { icon: ScanText, title: "Your business profile", detail: "Understood from your website or description" },
  { icon: FileSearch, title: "Opportunity research", detail: "Curated, sourced ASEAN records" },
  { icon: Gauge, title: "Fit assessment", detail: "Transparent, rule-based scoring" },
  { icon: ListChecks, title: "Action roadmap", detail: "Prioritised next steps" },
]

export function HowItWorks() {
  return (
    <section aria-label="How UpperTune works" className="rounded-2xl border border-dashed px-5 py-4 md:px-6">
      <p className="eyebrow mb-3">How UpperTune works</p>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex items-center gap-3">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground card-shadow">
              <s.icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-tight">{s.title}</span>
              <span className="block text-xs text-muted-foreground">{s.detail}</span>
            </span>
            {i < STEPS.length - 1 ? (
              <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground/50 lg:block" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
