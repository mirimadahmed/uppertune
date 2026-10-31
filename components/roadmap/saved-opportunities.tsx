"use client"

import Link from "next/link"
import { Bookmark, Handshake, Landmark } from "lucide-react"
import { FUNDING_CATEGORY_LABEL, PARTNERSHIP_CATEGORY_LABEL } from "@/components/shared/badges"
import { FitScore } from "@/components/shared/fit-score"
import { SaveButton } from "@/components/shared/save-button"
import { useIntelligence, useWorkspace } from "@/lib/workspace"

type SavedItem = {
  id: string
  kind: "funding" | "partner"
  name: string
  meta: string
  href: string
  fitScore: number
}

export function SavedOpportunities() {
  const { state } = useWorkspace()
  const { funding, partners } = useIntelligence()

  const items: SavedItem[] = []
  for (const id of [...state.savedIds].reverse()) {
    const f = funding.find((a) => a.opportunity.id === id)
    if (f) {
      items.push({
        id,
        kind: "funding",
        name: f.opportunity.title,
        meta: `${FUNDING_CATEGORY_LABEL[f.opportunity.category]} · ${f.opportunity.organisation}`,
        href: `/app/funding/${id}`,
        fitScore: f.fitScore,
      })
      continue
    }
    const p = partners.find((a) => a.partner.id === id)
    if (p) {
      items.push({
        id,
        kind: "partner",
        name: p.partner.name,
        meta: `${PARTNERSHIP_CATEGORY_LABEL[p.partner.category]} · ${p.partner.country}`,
        href: `/app/partnerships/${id}`,
        fitScore: p.fitScore,
      })
    }
  }

  return (
    <section className="rounded-2xl border bg-card card-shadow" aria-labelledby="saved-heading">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Bookmark className="size-4" aria-hidden />
          </span>
          <h2 id="saved-heading" className="text-base font-semibold tracking-tight">
            Saved opportunities
          </h2>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <span className="mx-auto mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <Bookmark className="size-4" aria-hidden />
          </span>
          <p className="text-sm font-medium">Nothing saved yet</p>
          <p className="mx-auto mt-1 max-w-60 text-sm leading-relaxed text-muted-foreground">
            Save funding programmes or partnerships to keep them here.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium">
            <Link href="/app/funding" className="text-primary underline-offset-4 hover:underline">
              Browse funding
            </Link>
            <Link href="/app/partnerships" className="text-primary underline-offset-4 hover:underline">
              Browse partnerships
            </Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y">
          {items.map((item) => {
            const Icon = item.kind === "funding" ? Landmark : Handshake
            return (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={item.href}
                    className="line-clamp-1 text-sm font-medium underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{item.meta}</p>
                </div>
                <FitScore score={item.fitScore} size="sm" />
                <SaveButton id={item.id} variant="icon" />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
