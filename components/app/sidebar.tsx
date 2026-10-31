"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, ChevronsUpDown, Settings2, UserRound } from "lucide-react"
import { Monogram, initialsOf } from "@/components/shared/monogram"
import { NAV_ITEMS, isNavActive, workspaceModeLabel, type NavItem } from "@/components/app/workspace-meta"
import { WorkspaceMenu } from "@/components/app/workspace-menu"
import { RELEVANCE_THRESHOLD } from "@/lib/matching"
import { useIntelligence, useWorkspace } from "@/lib/workspace"
import { cn } from "@/lib/utils"

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="UpperTune home">
      <span className="inline-flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
        <ArrowUpRight className="size-4" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="font-display text-[26px] leading-none tracking-tight">UpperTune</span>
    </Link>
  )
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { state, isDemo, getTaskStatus } = useWorkspace()
  const { funding, partners, people, tasks } = useIntelligence()
  const profile = state.profile
  const mode = workspaceModeLabel(state)

  const counts: Partial<Record<NavItem["key"], { value: number; title: string }>> = {
    funding: {
      value: funding.filter((a) => a.fitScore >= RELEVANCE_THRESHOLD).length,
      title: "Relevant funding opportunities",
    },
    partnerships: {
      value: partners.filter((a) => a.fitScore >= RELEVANCE_THRESHOLD).length,
      title: "Potential corporate partnerships",
    },
    people: { value: people.length, title: "Recommended people and roles" },
    "action-plan": {
      value: tasks.filter((t) => getTaskStatus(t) !== "completed").length,
      title: "Open tasks",
    },
  }

  const profileActive = isNavActive(pathname, "/app/profile")

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Wordmark />
      </div>

      <div className="px-3">
        <Link
          href="/app/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border bg-background/70 p-2.5 transition-colors hover:border-primary/25 hover:bg-accent/40"
        >
          <Monogram text={initialsOf(profile.name)} size="md" tone={isDemo ? "ink" : "primary"} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{profile.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {profile.industry.slice(0, 2).join(" · ") || "Industry not stated"}
            </span>
          </span>
        </Link>
      </div>

      <nav className="mt-6 flex-1 overflow-y-auto px-3" aria-label="Workspace">
        <p className="eyebrow mb-2 px-2.5">Intelligence</p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href)
            const count = counts[item.key]
            const Icon = item.icon
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors",
                    active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn("size-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}
                    aria-hidden
                  />
                  {item.label}
                  {count ? (
                    <span
                      title={`${count.value} ${count.title.toLowerCase()}`}
                      className={cn(
                        "ml-auto font-mono text-[11px] tabular-nums",
                        active ? "text-accent-foreground/70" : "text-muted-foreground/80",
                      )}
                    >
                      {count.value}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t p-3">
        <Link
          href="/app/profile"
          onClick={onNavigate}
          aria-current={profileActive ? "page" : undefined}
          className={cn(
            "flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors",
            profileActive
              ? "bg-accent font-medium text-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
          )}
        >
          <UserRound className={cn("size-4", profileActive && "text-primary")} aria-hidden />
          Startup profile
        </Link>

        <div
          className={cn(
            "rounded-xl px-3 py-2.5",
            isDemo ? "bg-accent-teal-soft/70" : "bg-accent/70",
          )}
        >
          <p
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              isDemo ? "text-accent-teal" : "text-accent-foreground",
            )}
          >
            <span className={cn("size-1.5 rounded-full", isDemo ? "bg-accent-teal" : "bg-primary")} aria-hidden />
            {mode.title}
          </p>
          <p className="mt-0.5 truncate pl-3.5 text-[11px] text-muted-foreground">{mode.detail}</p>
        </div>

        <WorkspaceMenu
          side="top"
          align="start"
          onAction={onNavigate}
          trigger={
            <button
              type="button"
              className="flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Settings2 className="size-4" aria-hidden />
              Workspace
              <ChevronsUpDown className="ml-auto size-3.5" aria-hidden />
            </button>
          }
        />
      </div>
    </div>
  )
}
