"use client"

import Link from "next/link"
import { ArrowRight, Factory, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EvidenceIndicator, OpportunityTypeBadge, PARTNERSHIP_CATEGORY_LABEL, Pill } from "@/components/shared/badges"
import { FitScore } from "@/components/shared/fit-score"
import { Monogram } from "@/components/shared/monogram"
import { SaveButton } from "@/components/shared/save-button"
import { cn } from "@/lib/utils"
import type { PartnerAssessment } from "@/lib/types"

export function PartnerCard({ assessment, muted = false }: { assessment: PartnerAssessment; muted?: boolean }) {
  const { partner, fitScore, nextStep } = assessment
  const href = `/app/partnerships/${partner.id}`

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card p-5 card-shadow transition-shadow duration-200 hover:card-shadow-lg md:p-6",
        muted && "bg-card/70",
      )}
    >
      <div className="flex items-start gap-4">
        <Monogram text={partner.monogram} size="md" tone={muted ? "ink" : "primary"} className={cn(muted && "opacity-70")} />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-snug tracking-tight">
            <Link href={href} className="outline-none transition-colors hover:text-primary focus-visible:text-primary">
              {partner.name}
            </Link>
          </h3>
          <p className="mt-1 flex min-w-0 items-center gap-x-3 text-sm text-muted-foreground">
            <span className="inline-flex shrink-0 items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {partner.country}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1" title={partner.industry}>
              <Factory className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{partner.industry}</span>
            </span>
          </p>
        </div>
        <FitScore score={fitScore} size="md" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <OpportunityTypeBadge type={partner.opportunityType} />
        <Pill>{PARTNERSHIP_CATEGORY_LABEL[partner.category]}</Pill>
      </div>

      <div className="mt-5 flex-1 space-y-4">
        <div>
          <p className="eyebrow">Strategic fit</p>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-foreground/85">{partner.strategicFit}</p>
        </div>
        <div>
          <p className="eyebrow">Potential collaboration</p>
          <p className="mt-1.5 line-clamp-1 text-sm text-foreground/85" title={partner.collaboration.pilotScope}>
            {partner.collaboration.pilotScope}
          </p>
        </div>
        <div className="rounded-xl border border-primary/10 bg-accent/60 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-foreground/80">
            Suggested next step
          </p>
          <p className="mt-1 text-sm leading-relaxed text-accent-foreground">{nextStep}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <EvidenceIndicator evidence={partner.evidence} />
        <div className="flex items-center gap-2">
          <SaveButton id={partner.id} variant="icon" />
          <Button asChild size="sm">
            <Link href={href}>
              View intelligence
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
