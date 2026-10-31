"use client"

import Link from "next/link"
import { ArrowRight, Check, Landmark, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  EligibilityBadge,
  EvidenceIndicator,
  FUNDING_CATEGORY_LABEL,
  OpportunityTypeBadge,
  PARTNERSHIP_CATEGORY_LABEL,
  ProvenanceBadge,
} from "@/components/shared/badges"
import { FitScore } from "@/components/shared/fit-score"
import { Monogram } from "@/components/shared/monogram"
import type { Evidence, FundingAssessment, PartnerAssessment } from "@/lib/types"

type HighlightProps = {
  kindLabel: string
  typeLabel: string
  title: string
  subtitle: string
  country: string
  description: string
  reasons: string[]
  nextStep: string
  evidence: Evidence[]
  fitScore: number
  href: string
  leading: React.ReactNode
  badges: React.ReactNode
}

function HighlightCard(props: HighlightProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border bg-card card-shadow transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4 p-5 md:p-6">
        {props.leading}
        <div className="min-w-0 flex-1">
          <p className="eyebrow">
            {props.kindLabel} · {props.typeLabel}
          </p>
          <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight">
            <Link href={props.href} className="hover:text-primary">
              {props.title}
            </Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span className="truncate">{props.subtitle}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {props.country}
            </span>
          </p>
        </div>
        <FitScore score={props.fitScore} size="md" />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 md:px-6">
        <div className="flex flex-wrap gap-1.5">{props.badges}</div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{props.description}</p>
        {props.reasons.length > 0 ? (
          <div>
            <p className="eyebrow mb-2">Why it is relevant</p>
            <ul className="space-y-1.5">
              {props.reasons.slice(0, 2).map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm leading-snug">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent-teal" aria-hidden />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-auto rounded-xl bg-background px-3.5 py-3">
          <p className="eyebrow mb-1">Next step</p>
          <p className="text-sm leading-snug">{props.nextStep}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-5 py-3.5 md:px-6">
        <EvidenceIndicator evidence={props.evidence} />
        <Button variant="ghost" size="sm" asChild className="-mr-2 text-primary hover:text-primary">
          <Link href={props.href}>
            View intelligence
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

export function FundingHighlightCard({ assessment }: { assessment: FundingAssessment }) {
  const o = assessment.opportunity
  return (
    <HighlightCard
      kindLabel="Funding"
      typeLabel={FUNDING_CATEGORY_LABEL[o.category]}
      title={o.title}
      subtitle={o.organisation}
      country={o.country}
      description={o.summary}
      reasons={assessment.reasons}
      nextStep={assessment.nextStep}
      evidence={o.evidence}
      fitScore={assessment.fitScore}
      href={`/app/funding/${o.id}`}
      leading={
        <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground sm:inline-flex">
          <Landmark className="size-5" aria-hidden />
        </span>
      }
      badges={
        <>
          <EligibilityBadge status={assessment.eligibility} />
          {o.demoOnly ? <ProvenanceBadge kind="illustrative" /> : null}
        </>
      }
    />
  )
}

export function PartnerHighlightCard({ assessment }: { assessment: PartnerAssessment }) {
  const p = assessment.partner
  return (
    <HighlightCard
      kindLabel="Partnership"
      typeLabel={PARTNERSHIP_CATEGORY_LABEL[p.category]}
      title={p.name}
      subtitle={p.industry}
      country={p.country}
      description={p.strategicFit || p.description}
      reasons={assessment.reasons}
      nextStep={assessment.nextStep}
      evidence={p.evidence}
      fitScore={assessment.fitScore}
      href={`/app/partnerships/${p.id}`}
      leading={<Monogram text={p.monogram} size="md" tone="teal" className="hidden sm:inline-flex" />}
      badges={
        <>
          <OpportunityTypeBadge type={p.opportunityType} />
          {p.demoOnly ? <ProvenanceBadge kind="illustrative" /> : null}
        </>
      }
    />
  )
}
