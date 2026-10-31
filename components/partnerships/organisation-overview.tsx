"use client"

import { ExternalLink, hostnameOf } from "@/components/shared/external-link"
import { cn } from "@/lib/utils"
import type { CorporatePartner, Evidence } from "@/lib/types"

const STOP = new Set(["with", "that", "this", "from", "into", "their", "across", "through", "about", "using", "will", "have", "more"])

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w)),
  )
}

/** Pairs each stated priority with the evidence item whose claim overlaps it most. */
function sourceFor(priority: string, index: number, evidence: Evidence[]): Evidence | undefined {
  const p = tokens(priority)
  let best: Evidence | undefined
  let bestScore = 0
  for (const e of evidence) {
    const c = tokens(`${e.claim} ${e.excerpt ?? ""}`)
    let score = 0
    for (const w of p) if (c.has(w)) score++
    if (score > bestScore) {
      best = e
      bestScore = score
    }
  }
  if (best) return best
  const official = evidence.filter((e) => e.sourceType === "official")
  return official[index] ?? official[0]
}

const STATUS_DOT: Record<Evidence["verificationStatus"], string> = {
  verified: "bg-success",
  needs_confirmation: "bg-warning",
  illustrative: "bg-muted-foreground/50",
}

const STATUS_TEXT: Record<Evidence["verificationStatus"], string> = {
  verified: "Verified",
  needs_confirmation: "Needs confirmation",
  illustrative: "Illustrative",
}

export function OrganisationOverview({ partner }: { partner: CorporatePartner }) {
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-[15px] leading-relaxed text-foreground/90">{partner.description}</p>

      <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
        <div className="bg-card px-4 py-3.5">
          <dt className="eyebrow">Industry</dt>
          <dd className="mt-1.5 text-sm font-medium">{partner.industry}</dd>
        </div>
        <div className="bg-card px-4 py-3.5">
          <dt className="eyebrow">Relevant markets</dt>
          <dd className="mt-1.5 text-sm font-medium">{partner.markets.join(", ")}</dd>
        </div>
        <div className="bg-card px-4 py-3.5">
          <dt className="eyebrow">Official website</dt>
          <dd className="mt-1.5">
            <ExternalLink href={partner.website}>{hostnameOf(partner.website)}</ExternalLink>
          </dd>
        </div>
      </dl>

      {partner.businessPriorities.length > 0 ? (
        <div>
          <p className="eyebrow">Publicly stated priorities</p>
          <ul className="mt-3 space-y-2.5">
            {partner.businessPriorities.map((priority, i) => {
              const source = sourceFor(priority, i, partner.evidence)
              return (
                <li key={priority} className="rounded-xl border bg-background/50 px-4 py-3">
                  <p className="text-sm font-medium leading-relaxed">{priority}</p>
                  {source ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn("size-1.5 rounded-full", STATUS_DOT[source.verificationStatus])} aria-hidden />
                        {STATUS_TEXT[source.verificationStatus]}
                      </span>
                      <ExternalLink href={source.sourceUrl} className="text-xs">
                        {source.sourceTitle}
                      </ExternalLink>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">Source: see Evidence and sources below.</p>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
