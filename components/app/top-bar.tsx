"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Monogram, initialsOf } from "@/components/shared/monogram"
import { WorkspaceMenu } from "@/components/app/workspace-menu"
import { NAV_ITEMS, workspaceModeLabel } from "@/components/app/workspace-meta"
import { useIntelligence, useWorkspace } from "@/lib/workspace"
import { cn } from "@/lib/utils"

type Crumb = { label: string; href?: string }

function useBreadcrumbs(): Crumb[] {
  const pathname = usePathname()
  const { funding, partners } = useIntelligence()
  const segments = pathname.split("/").filter(Boolean)
  const section = segments[1]
  const id = segments[2] ? decodeURIComponent(segments[2]) : undefined

  if (!section) return [{ label: "Overview" }]
  if (section === "profile") return [{ label: "Startup profile" }]

  const nav = NAV_ITEMS.find((n) => n.href === `/app/${section}`)
  const sectionLabel = nav?.label ?? section.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  if (!id) return [{ label: sectionLabel }]

  let detail = "Not found"
  if (section === "funding") detail = funding.find((a) => a.opportunity.id === id)?.opportunity.title ?? detail
  else if (section === "partnerships") detail = partners.find((a) => a.partner.id === id)?.partner.name ?? detail
  else detail = id
  return [{ label: sectionLabel, href: nav?.href ?? `/app/${section}` }, { label: detail }]
}

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const crumbs = useBreadcrumbs()
  const { state, isDemo } = useWorkspace()
  const mode = workspaceModeLabel(state)

  return (
    <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-12">
        <Button
          variant="ghost"
          size="icon-sm"
          className="-ml-1 lg:hidden"
          onClick={onOpenMenu}
          aria-label="Open navigation"
        >
          <Menu />
        </Button>

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex min-w-0 items-center gap-2.5 text-sm">
            <li className="hidden shrink-0 items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:flex">
              <span className="h-px w-6 bg-foreground/30" aria-hidden />
              Workspace
            </li>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1
              return (
                <li key={`${c.label}-${i}`} className={cn("flex min-w-0 items-center gap-2.5", !last && "shrink-0")}>
                  <span className={cn("font-mono text-xs text-foreground/25", i === 0 && "hidden sm:inline")} aria-hidden>
                    /
                  </span>
                  {c.href && !last ? (
                    <Link
                      href={c.href}
                      className="group relative text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {c.label}
                      <span
                        className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full"
                        aria-hidden
                      />
                    </Link>
                  ) : (
                    <span className="truncate font-medium text-foreground" aria-current={last ? "page" : undefined}>
                      {c.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-foreground/15 px-3 py-1 font-mono text-[11px] text-foreground md:inline-flex">
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
            <span className="hidden text-muted-foreground xl:inline">· {mode.detail}</span>
          </span>

          <WorkspaceMenu
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-none border-foreground/15 bg-transparent pl-1.5 pr-2.5 shadow-none hover:border-foreground/40 hover:bg-transparent"
                aria-label="Workspace menu"
              >
                <Monogram text={initialsOf(state.profile.name)} size="sm" tone={isDemo ? "ink" : "primary"} className="size-6 text-[10px]" />
                <span className="hidden max-w-[160px] truncate sm:inline">{state.profile.name}</span>
                <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
              </Button>
            }
          />
        </div>
      </div>
    </header>
  )
}
