"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, Menu } from "lucide-react"
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
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
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
          <ol className="flex min-w-0 items-center gap-1.5 text-sm">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1
              return (
                <li key={`${c.label}-${i}`} className={cn("flex min-w-0 items-center gap-1.5", !last && "shrink-0")}>
                  {i > 0 ? <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden /> : null}
                  {c.href && !last ? (
                    <Link href={c.href} className="text-muted-foreground transition-colors hover:text-foreground">
                      {c.label}
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
          <span
            className={cn(
              "hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium md:inline-flex",
              isDemo
                ? "border-accent-teal/15 bg-accent-teal-soft text-accent-teal"
                : "border-primary/15 bg-accent text-accent-foreground",
            )}
          >
            <span className={cn("size-1.5 rounded-full", isDemo ? "bg-accent-teal" : "bg-primary")} aria-hidden />
            {mode.title}
            <span className="hidden font-normal opacity-80 xl:inline">· {mode.detail}</span>
          </span>

          <WorkspaceMenu
            trigger={
              <Button variant="outline" size="sm" className="h-9 gap-2 pl-1.5 pr-2.5" aria-label="Workspace menu">
                <Monogram text={initialsOf(state.profile.name)} size="sm" tone={isDemo ? "ink" : "primary"} className="size-6 rounded-md text-[10px]" />
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
