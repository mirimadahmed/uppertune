"use client"

import { Handshake, Landmark, ListTodo, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { ProgressSummary } from "@/components/roadmap/progress-summary"
import { SavedOpportunities } from "@/components/roadmap/saved-opportunities"
import { TaskCard } from "@/components/roadmap/task-card"
import { useIntelligence, useWorkspace } from "@/lib/workspace"
import type { TaskGroup } from "@/lib/types"

const GROUPS: { id: TaskGroup; title: string; description: string; icon: LucideIcon }[] = [
  {
    id: "funding",
    title: "Funding applications",
    description: "Prepare and submit applications for your strongest funding matches.",
    icon: Landmark,
  },
  {
    id: "partnerships",
    title: "Corporate partnerships",
    description: "Turn strategic fits into conversations and proof-of-concept pilots.",
    icon: Handshake,
  },
  {
    id: "network",
    title: "Network and mentorship",
    description: "Reach the people who can open doors and sharpen your approach.",
    icon: Users,
  },
]

export default function ActionPlanPage() {
  const { tasks } = useIntelligence()
  const { getTaskStatus } = useWorkspace()

  const statuses = tasks.map((t) => getTaskStatus(t))
  const counts = {
    total: tasks.length,
    completed: statuses.filter((s) => s === "completed").length,
    inProgress: statuses.filter((s) => s === "in_progress").length,
    notStarted: statuses.filter((s) => s === "not_started").length,
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Action plan"
        title="Your growth roadmap"
        description="An actionable plan to turn your strongest opportunities into real outcomes."
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          description="Your roadmap is built from relevant funding, partnership and people matches. None were found for the current profile."
        />
      ) : (
        <>
          <ProgressSummary counts={counts} />

          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-10">
              {GROUPS.map((group, index) => {
                const groupTasks = tasks.filter((t) => t.group === group.id)
                const done = groupTasks.filter((t) => getTaskStatus(t) === "completed").length
                const Icon = group.icon
                return (
                  <section key={group.id} aria-labelledby={`group-${group.id}`} className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-medium text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h2 id={`group-${group.id}`} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                            <Icon className="size-4 text-muted-foreground" aria-hidden />
                            {group.title}
                          </h2>
                          <p className="mt-0.5 text-sm text-muted-foreground">{group.description}</p>
                        </div>
                      </div>
                      {groupTasks.length > 0 ? (
                        <p className="font-mono text-xs tabular-nums text-muted-foreground">
                          {done}/{groupTasks.length} complete
                        </p>
                      ) : null}
                    </div>
                    {groupTasks.length > 0 ? (
                      <div className="space-y-4">
                        {groupTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-dashed bg-card/60 px-5 py-6 text-sm text-muted-foreground">
                        No tasks in this group for the current profile.
                      </p>
                    )}
                  </section>
                )
              })}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24">
              <SavedOpportunities />
              <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                Progress and saved opportunities are stored in this browser. Deadlines appear only when sourced or
                explicitly proposed.
              </p>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
