"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarClock, ChevronDown, CircleCheck, CircleDashed, CircleDot, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRIORITY_LABEL, Pill, TASK_STATUS_LABEL } from "@/components/shared/badges"
import type { PillTone } from "@/components/shared/badges"
import { CopyButton } from "@/components/shared/copy-button"
import { ExternalLink } from "@/components/shared/external-link"
import { SaveButton } from "@/components/shared/save-button"
import { resolveRelated } from "@/components/roadmap/related"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/lib/workspace"
import type { RoadmapTask, TaskPriority, TaskStatus } from "@/lib/types"

const PRIORITY_TONE: Record<TaskPriority, PillTone> = { high: "warning", medium: "info", low: "neutral" }

const STATUS_ICON = {
  not_started: { icon: CircleDashed, className: "text-muted-foreground" },
  in_progress: { icon: CircleDot, className: "text-primary" },
  completed: { icon: CircleCheck, className: "text-success" },
} as const

const STATUSES: TaskStatus[] = ["not_started", "in_progress", "completed"]

function formatDeadline(value: string): string {
  const t = Date.parse(value)
  if (Number.isNaN(t)) return value
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function checklistText(task: RoadmapTask): string {
  return [task.title, "", ...(task.checklist ?? []).map((item) => `[ ] ${item}`)].join("\n")
}

export function TaskCard({ task }: { task: RoadmapTask }) {
  const { getTaskStatus, setTaskStatus } = useWorkspace()
  const [showChecklist, setShowChecklist] = useState(false)
  const status = getTaskStatus(task)
  const completed = status === "completed"
  const related = resolveRelated(task.relatedOpportunityId, task.relatedType)
  const canSave = related && (related.kind === "funding" || related.kind === "partner")
  const StatusIcon = STATUS_ICON[status].icon

  const changeStatus = (next: TaskStatus) => {
    if (next === status) return
    setTaskStatus(task.id, next)
    if (next === "completed") toast.success("Task marked complete")
    else if (status === "completed") toast("Task reopened")
    else toast(next === "in_progress" ? "Task marked in progress" : "Task marked not started")
  }

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card card-shadow transition-colors duration-200",
        completed && "bg-card/60 shadow-none",
      )}
    >
      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <StatusIcon className={cn("mt-0.5 size-5 shrink-0", STATUS_ICON[status].className)} aria-hidden />
            <div className="min-w-0">
              <h3
                className={cn(
                  "text-base font-semibold leading-snug tracking-tight",
                  completed && "text-muted-foreground line-through decoration-foreground/30",
                )}
              >
                {task.title}
              </h3>
              {related ? (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {related.kindLabel}:{" "}
                  <Link
                    href={related.href}
                    className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    {related.name}
                  </Link>
                  {related.detail ? <span className="text-muted-foreground/80"> · {related.detail}</span> : null}
                </p>
              ) : null}
              <Pill tone={completed ? "neutral" : PRIORITY_TONE[task.priority]} className="mt-2.5">
                {PRIORITY_LABEL[task.priority]}
              </Pill>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
            <Select value={status} onValueChange={(v) => changeStatus(v as TaskStatus)}>
              <SelectTrigger size="sm" className="w-36 bg-card" aria-label={`Status for ${task.title}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {TASK_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className={cn("mt-4 grid gap-4 pl-8 transition-opacity md:grid-cols-2", completed && "opacity-60")}>
          <div>
            <p className="eyebrow">Why this matters</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{task.reason}</p>
          </div>
          <div>
            <p className="eyebrow">Suggested next step</p>
            <p className="mt-1.5 flex items-start gap-2 text-sm leading-relaxed text-foreground/85">
              <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              <span>{task.nextStep}</span>
            </p>
          </div>
        </div>

        {task.deadline ? (
          <div className={cn("mt-4 flex flex-wrap items-center gap-2 pl-8 text-sm", completed && "opacity-60")}>
            <Pill tone="info" icon={CalendarClock}>
              {formatDeadline(task.deadline)}
            </Pill>
            {task.deadlineNote ? <span className="text-xs text-muted-foreground">{task.deadlineNote}</span> : null}
          </div>
        ) : task.deadlineNote ? (
          <p
            className={cn(
              "mt-4 flex items-start gap-2 pl-8 text-xs leading-relaxed text-muted-foreground",
              completed && "opacity-60",
            )}
          >
            <CalendarClock className="mt-px size-3.5 shrink-0" aria-hidden />
            {task.deadlineNote}
          </p>
        ) : null}

        {task.checklist && task.checklist.length > 0 ? (
          <div className={cn("mt-4 pl-8", completed && "opacity-60")}>
            <button
              type="button"
              onClick={() => setShowChecklist((v) => !v)}
              aria-expanded={showChecklist}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown className={cn("size-4 transition-transform duration-200", showChecklist && "rotate-180")} aria-hidden />
              {showChecklist ? "Hide" : "Show"} checklist · {task.checklist.length}{" "}
              {task.checklist.length === 1 ? "item" : "items"}
            </button>
            {showChecklist ? (
              <ul className="animate-fade-up mt-3 space-y-1.5 rounded-xl border bg-background/60 p-4">
                {task.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/85">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {completed ? (
            <Button type="button" variant="outline" size="sm" onClick={() => changeStatus("not_started")}>
              <RotateCcw aria-hidden />
              Reopen
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={() => changeStatus("completed")}>
              <CircleCheck aria-hidden />
              Mark complete
            </Button>
          )}
          {task.checklist && task.checklist.length > 0 ? (
            <CopyButton text={checklistText(task)} label="Copy checklist" toastMessage="Checklist copied" variant="ghost" />
          ) : null}
          {canSave && related ? <SaveButton id={related.id} variant="button" /> : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {task.sourceUrl ? <ExternalLink href={task.sourceUrl}>Related source</ExternalLink> : null}
          {related ? (
            <Link
              href={related.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View {related.kind === "person" ? "contact" : "opportunity"}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
