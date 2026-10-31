"use client"

import Link from "next/link"
import { ArrowRight, Banknote, CalendarDays, Check, CircleHelp, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ApplicationStatusBadge,
  EligibilityBadge,
  FUNDING_CATEGORY_LABEL,
  Pill,
  ProvenanceBadge,
} from "@/components/shared/badges"
import { FitScore } from "@/components/shared/fit-score"
import { SaveButton } from "@/components/shared/save-button"
import type { FundingAssessment } from "@/lib/types"
import { cn } from "@/lib/utils"

export function FundingCard({ assessment, muted = false }: { assessment: FundingAssessment; muted?: boolean }) {
  const o = assessment.opportunity
  const href = `/app/funding/${o.id}`

  return (
    <article
      className={cn(
        "group rounded-2xl border bg-card card-shadow transition-[box-shadow,border-color] hover:border-primary/20 hover:shadow-md",
        muted && "bg-card/70",
      )}
    >
      <div className="flex flex-col gap-5 p-5 md:flex-row md:p-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill tone="neutral">{FUNDING_CATEGORY_LABEL[o.category]}</Pill>
            <ApplicationStatusBadge status={o.applicationStatus} deadline={o.deadline} />
            {o.demoOnly ? <ProvenanceBadge kind="illustrative" /> : null}
          </div>

          <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight md:text-xl">
            <Link href={href} className="hover:text-primary">
              {o.title}
            </Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>{o.organisation}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {o.country}
            </span>
          </p>

          <p className="mt-3 text-sm leading-relaxed text-foreground/85">{o.summary}</p>

          {assessment.reasons.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {assessment.reasons.slice(0, 2).map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm leading-snug text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent-teal" aria-hidden />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {o.fundingAmount || o.deadline ? (
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {o.fundingAmount ? (
                <div className="flex items-center gap-2">
                  <Banknote className="size-4 text-muted-foreground" aria-hidden />
                  <dt className="text-muted-foreground">Funding</dt>
                  <dd className="font-medium">{o.fundingAmount}</dd>
                </div>
              ) : null}
              {o.deadline ? (
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                  <dt className="text-muted-foreground">Deadline</dt>
                  <dd className="font-medium">{o.deadline}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {assessment.unknowns.length > 0 ? (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft/60 px-3 py-2 text-[13px] leading-snug text-foreground/80">
              <CircleHelp className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
              <span>
                <span className="font-medium text-warning">Needs confirmation:</span>{" "}
                {assessment.unknowns.slice(0, 3).join(", ")}
                {assessment.unknowns.length > 3 ? ` and ${assessment.unknowns.length - 3} more` : ""}
              </span>
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t pt-4 md:w-52 md:flex-col md:items-end md:justify-start md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="flex items-center gap-3 md:flex-col md:items-end">
            <FitScore score={assessment.fitScore} size="md" label />
            <EligibilityBadge status={assessment.eligibility} />
          </div>
          <div className="flex items-center gap-1 md:mt-auto">
            <SaveButton id={o.id} variant="icon" />
            <Button size="sm" asChild>
              <Link href={href}>
                View intelligence
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
