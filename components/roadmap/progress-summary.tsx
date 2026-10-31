import { CircleCheck, CircleDashed, CircleDot, ListTodo } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProgressCounts = { total: number; completed: number; inProgress: number; notStarted: number }

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: LucideIcon; tone: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 card-shadow">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <span className={cn("inline-flex size-8 items-center justify-center rounded-lg", tone)}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-4xl leading-none tabular-nums">{value}</p>
    </div>
  )
}

export function ProgressSummary({ counts }: { counts: ProgressCounts }) {
  const { total, completed, inProgress, notStarted } = counts
  const pct = (n: number) => (total ? (n / total) * 100 : 0)
  const completePct = Math.round(pct(completed))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total tasks" value={total} icon={ListTodo} tone="bg-secondary text-foreground" />
        <Stat label="Completed" value={completed} icon={CircleCheck} tone="bg-success-soft text-success" />
        <Stat label="In progress" value={inProgress} icon={CircleDot} tone="bg-accent text-accent-foreground" />
        <Stat label="Not started" value={notStarted} icon={CircleDashed} tone="bg-secondary text-muted-foreground" />
      </div>
      <div className="rounded-2xl border bg-card px-5 py-4 card-shadow">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium">Overall progress</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{completePct}%</span> · {completed} of {total}{" "}
            {total === 1 ? "task" : "tasks"} complete
          </p>
        </div>
        <div
          className="mt-3 flex h-2 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completePct}
          aria-label="Tasks completed"
        >
          <div className="h-full bg-success transition-all duration-500" style={{ width: `${pct(completed)}%` }} />
          <div className="h-full bg-primary/60 transition-all duration-500" style={{ width: `${pct(inProgress)}%` }} />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            Completed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary/60" aria-hidden />
            In progress
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-secondary ring-1 ring-border" aria-hidden />
            Not started
          </span>
        </div>
      </div>
    </div>
  )
}
