"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight, CircleCheck } from "lucide-react"
import { PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/components/shared/badges"
import { taskHref } from "@/components/app/workspace-meta"
import { useIntelligence, useWorkspace } from "@/lib/workspace"
import type { TaskPriority } from "@/lib/types"
import { cn } from "@/lib/utils"

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }
const PRIORITY_DOT: Record<TaskPriority, string> = {
  high: "bg-danger",
  medium: "bg-warning",
  low: "bg-muted-foreground/50",
}

export function NextMoves({ limit = 5 }: { limit?: number }) {
  const { tasks } = useIntelligence()
  const { getTaskStatus } = useWorkspace()

  const completed = tasks.filter((t) => getTaskStatus(t) === "completed").length
  const open = tasks
    .map((task, index) => ({ task, index, status: getTaskStatus(task) }))
    .filter((t) => t.status !== "completed")
    .sort((a, b) => PRIORITY_ORDER[a.task.priority] - PRIORITY_ORDER[b.task.priority] || a.index - b.index)
    .slice(0, limit)

  return (
    <section className="flex h-full flex-col rounded-2xl border bg-card card-shadow">
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4 md:px-6">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Your next moves</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tasks.length > 0
              ? `${completed} of ${tasks.length} roadmap tasks completed`
              : "No roadmap tasks for this profile yet"}
          </p>
        </div>
        <Link
          href="/app/action-plan"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Action plan
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      {open.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <CircleCheck className="size-6 text-success" aria-hidden />
          <p className="text-sm font-medium">{tasks.length > 0 ? "Every task is complete" : "Nothing to do yet"}</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {tasks.length > 0
              ? "Revisit the action plan to review what you have finished."
              : "Tasks appear once UpperTune finds relevant opportunities for your profile."}
          </p>
        </div>
      ) : (
        <ol className="flex-1 divide-y">
          {open.map(({ task, status }) => (
            <li key={task.id}>
              <Link
                href={taskHref(task)}
                className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-background/70 md:px-6"
              >
                <span
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", PRIORITY_DOT[task.priority])}
                  title={PRIORITY_LABEL[task.priority]}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug group-hover:text-primary">{task.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{PRIORITY_LABEL[task.priority]}</span>
                    {status === "in_progress" ? (
                      <>
                        <span aria-hidden>·</span>
                        <span className="font-medium text-primary">{TASK_STATUS_LABEL[status]}</span>
                      </>
                    ) : null}
                    {task.deadline ? (
                      <>
                        <span aria-hidden>·</span>
                        <span>
                          {task.deadlineNote ? `${task.deadlineNote}: ` : "Due "}
                          {task.deadline}
                        </span>
                      </>
                    ) : null}
                  </span>
                </span>
                <ArrowUpRight
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
