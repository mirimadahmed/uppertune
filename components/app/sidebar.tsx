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
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="UpperTune home">
      <span className="inline-flex size-7 items-center justify-center bg-primary text-primary-foreground">
        <ArrowUpRight
          className="size-4 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px"
          strokeWidth={2.25}
          aria-hidden
        />
      </span>
      <span className="font-display text-[28px] leading-none tracking-tight">UpperTune</span>
      <span className="mt-1 font-mono text-[10px] text-muted-foreground">ASEAN</span>
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
      <div className="flex h-16 shrink-0 items-center border-b border-foreground/10 px-5">
        <Wordmark />
      </div>

      <div className="border-b border-foreground/10 px-3 py-3">
        <Link
          href="/app/profile"
          onClick={onNavigate}
          className="group flex items-center gap-3 border border-foreground/10 bg-card p-2.5 transition-colors hover:border-foreground/40"
        >
          <Monogram text={initialsOf(profile.name)} size="md" tone={isDemo ? "ink" : "primary"} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-xl leading-tight">{profile.name}</span>
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {profile.industry.slice(0, 2).join(" · ") || "Industry not stated"}
            </span>
          </span>
          <ArrowUpRight
            className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden
          />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-6" aria-label="Workspace">
        <p className="mb-3 flex items-center gap-3 px-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="h-px w-6 bg-foreground/30" aria-hidden />
          Intelligence
        </p>
        <ul className="space-y-px">
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
                    "group relative flex h-10 items-center gap-3 px-2.5 text-sm transition-colors duration-200",
                    active
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn("size-4", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")}
                    aria-hidden
                  />
                  <span className="relative">
                    {item.label}
                    {!active ? (
                      <span
                        className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  {count ? (
                    <span
                      title={`${count.value} ${count.title.toLowerCase()}`}
                      className={cn(
                        "ml-auto font-mono text-[11px] tabular-nums",
                        active ? "text-primary-foreground/70" : "text-muted-foreground/80",
                      )}
                    >
                      {String(count.value).padStart(2, "0")}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-foreground/10 p-3">
        <Link
          href="/app/profile"
          onClick={onNavigate}
          aria-current={profileActive ? "page" : undefined}
          className={cn(
            "flex h-10 items-center gap-3 px-2.5 text-sm transition-colors duration-200",
            profileActive
              ? "bg-primary font-medium text-primary-foreground"
              : "text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground",
          )}
        >
          <UserRound className={cn("size-4", profileActive ? "text-primary-foreground" : "text-muted-foreground")} aria-hidden />
          Startup profile
        </Link>

        <div className="border border-foreground/10 px-3 py-2.5">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
            <span className="relative flex size-1.5" aria-hidden>
              <span
                className={cn(
                  "absolute inline-flex size-full animate-ping rounded-full opacity-60",
                  isDemo ? "bg-accent-teal" : "bg-success",
                )}
              />
              <span className={cn("relative inline-flex size-1.5 rounded-full", isDemo ? "bg-accent-teal" : "bg-success")} />
            </span>
            {mode.title}
          </p>
          <p className="mt-1 truncate pl-3.5 text-[11px] text-muted-foreground">{mode.detail}</p>
        </div>

        <WorkspaceMenu
          side="top"
          align="start"
          onAction={onNavigate}
          trigger={
            <button
              type="button"
              className="flex h-10 w-full items-center gap-3 px-2.5 text-sm text-foreground/65 transition-colors hover:bg-foreground/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
