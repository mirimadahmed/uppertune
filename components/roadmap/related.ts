import { corporatePartners } from "@/data/corporate-partners"
import { fundingOpportunities } from "@/data/funding-opportunities"
import { recommendedPeople } from "@/data/people"
import type { RoadmapTask } from "@/lib/types"

export type RelatedRef = {
  kind: "funding" | "partner" | "person"
  id: string
  name: string
  /** Short qualifier, e.g. the organisation behind a funding programme. */
  detail?: string
  href: string
  kindLabel: string
}

/** Resolves an opportunity/person id against the real datasets. Returns null when it doesn't exist. */
export function resolveRelated(id: string | undefined, type?: RoadmapTask["relatedType"]): RelatedRef | null {
  if (!id) return null
  if (!type || type === "funding") {
    const f = fundingOpportunities.find((x) => x.id === id)
    if (f) {
      return { kind: "funding", id, name: f.title, detail: f.organisation, href: `/app/funding/${id}`, kindLabel: "Funding" }
    }
  }
  if (!type || type === "partner") {
    const p = corporatePartners.find((x) => x.id === id)
    if (p) {
      return { kind: "partner", id, name: p.name, detail: p.country, href: `/app/partnerships/${id}`, kindLabel: "Partnership" }
    }
  }
  if (!type || type === "person") {
    const r = recommendedPeople.find((x) => x.id === id)
    if (r) {
      return {
        kind: "person",
        id,
        name: r.name ?? r.role,
        detail: r.organisation,
        href: `/app/people#${id}`,
        kindLabel: r.name ? "Contact" : "Suggested contact role",
      }
    }
  }
  return null
}
