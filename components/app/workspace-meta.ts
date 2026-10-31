import { Handshake, Landmark, LayoutDashboard, ListChecks, Users, type LucideIcon } from "lucide-react"
import type { ProfileSource, RoadmapTask, WorkspaceState } from "@/lib/types"

export type NavItem = {
  key: "overview" | "funding" | "partnerships" | "people" | "action-plan"
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", href: "/app", icon: LayoutDashboard },
  { key: "funding", label: "Funding", href: "/app/funding", icon: Landmark },
  { key: "partnerships", label: "Partnerships", href: "/app/partnerships", icon: Handshake },
  { key: "people", label: "People", href: "/app/people", icon: Users },
  { key: "action-plan", label: "Action plan", href: "/app/action-plan", icon: ListChecks },
]

export function isNavActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function urlHostname(url?: string): string | undefined {
  if (!url) return undefined
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function formatDateTime(iso?: string): string | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return undefined
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export const PROFILE_SOURCE_LABEL: Record<ProfileSource, string> = {
  demo: "Illustrative demo startup profile",
  gemma: "Extracted by Gemma 4 from the startup's website",
  founder: "Built from the founder's description",
}

/** One-line description of what was analysed, using only what the workspace actually recorded. */
export function describeAnalysis(state: WorkspaceState): string {
  const parts: string[] = []
  const host = urlHostname(state.analysedUrl)
  if (state.profileSource === "demo") parts.push(host ? `Curated demo profile · ${host}` : "Curated demo profile")
  else if (state.profileSource === "gemma") parts.push(host ? `Website analysed by Gemma 4 · ${host}` : "Analysed by Gemma 4")
  else parts.push(host ? `Founder description · ${host}` : "Founder description analysed")
  const when = formatDateTime(state.analysedAt)
  if (when) parts.push(when)
  return parts.join(" · ")
}

export function workspaceModeLabel(state: WorkspaceState): { title: string; detail: string } {
  if (state.mode === "demo") return { title: "Demo workspace", detail: "Curated sample opportunities" }
  const host = urlHostname(state.analysedUrl)
  return { title: "Live analysis", detail: host ?? "Founder description" }
}

export function taskHref(task: RoadmapTask): string {
  if (task.relatedOpportunityId && task.relatedType === "funding") return `/app/funding/${task.relatedOpportunityId}`
  if (task.relatedOpportunityId && task.relatedType === "partner") return `/app/partnerships/${task.relatedOpportunityId}`
  if (task.relatedOpportunityId && task.relatedType === "person") return `/app/people#${task.relatedOpportunityId}`
  return "/app/action-plan"
}
