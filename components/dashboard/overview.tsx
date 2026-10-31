"use client"

import Link from "next/link"
import { ArrowRight, Handshake, Info, Landmark, Users, type LucideIcon } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { describeAnalysis } from "@/components/app/workspace-meta"
import { FundingHighlightCard, PartnerHighlightCard } from "@/components/dashboard/highlight-cards"
import { HowItWorks } from "@/components/dashboard/how-it-works"
import { NextMoves } from "@/components/dashboard/next-moves"
import { ProfileSummaryCard } from "@/components/dashboard/profile-summary-card"
import { RELEVANCE_THRESHOLD } from "@/lib/matching"
import { useIntelligence, useWorkspace } from "@/lib/workspace"

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

function MetricCard({
  href,
  icon: Icon,
  label,
  value,
  caption,
  cta,
}: {
  href: string
  icon: LucideIcon
  label: string
  value: number
  caption: string
  cta: string
}) {
  return (
    <Link href={href} className="group flex flex-col bg-card p-6 transition-colors hover:bg-background lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden />
      </div>
      <span className="mt-6 font-display text-7xl leading-none tabular-nums tracking-tight lg:text-8xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-4 text-sm leading-relaxed text-muted-foreground">{caption}</span>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
        <span className="relative">
          {cta}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" aria-hidden />
        </span>
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  )
}

export function Overview() {
  const { state } = useWorkspace()
  const { funding, partners, people } = useIntelligence()

  const relevantFunding = funding.filter((a) => a.fitScore >= RELEVANCE_THRESHOLD)
  const relevantPartners = partners.filter((a) => a.fitScore >= RELEVANCE_THRESHOLD)
  const verifiedPeople = people.filter((p) => p.person.contactType === "verified_person").length
  const suggestedRoles = people.length - verifiedPeople
  const publishedPartners = relevantPartners.filter((p) => p.partner.opportunityType === "published_opportunity").length

  const topFunding = relevantFunding.slice(0, 2)
  const topPartners = relevantPartners.slice(0, 2)
  const notes = state.analysisNotes?.filter(Boolean) ?? []

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <PageHeader
          eyebrow="Overview"
          title="Your startup growth intelligence"
          description={
            <>
              Here is what UpperTune uncovered for <span className="font-medium text-foreground">{state.profile.name}</span>.
            </>
          }
        />
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-accent-teal" aria-hidden />
          {describeAnalysis(state)}
        </p>
        {notes.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {notes.map((n) => (
              <li key={n} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {n}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-px border border-foreground/10 bg-foreground/10 md:grid-cols-3">
        <MetricCard
          href="/app/funding"
          icon={Landmark}
          label="Relevant funding"
          value={relevantFunding.length}
          caption={`of ${plural(funding.length, "programme", "programmes")} assessed against your profile`}
          cta="Explore funding"
        />
        <MetricCard
          href="/app/partnerships"
          icon={Handshake}
          label="Corporate partnerships"
          value={relevantPartners.length}
          caption={
            publishedPartners > 0
              ? `${publishedPartners} published · ${relevantPartners.length - publishedPartners} potential, of ${plural(partners.length, "organisation", "organisations")} assessed`
              : `of ${plural(partners.length, "organisation", "organisations")} assessed for partnership fit`
          }
          cta="Explore partnerships"
        />
        <MetricCard
          href="/app/people"
          icon={Users}
          label="Recommended people"
          value={people.length}
          caption={`${plural(verifiedPeople, "verified contact", "verified contacts")} · ${plural(suggestedRoles, "suggested role", "suggested roles")}`}
          cta="Explore people"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProfileSummaryCard />
        </div>
        <div className="lg:col-span-2">
          <NextMoves />
        </div>
      </div>

      <section aria-labelledby="strongest-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="mb-4 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
              <span className="h-px w-8 bg-foreground/30" aria-hidden />
              Highest fit
            </span>
            <h2 id="strongest-heading" className="font-display text-4xl tracking-tight lg:text-5xl">
              Your strongest opportunities
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Highest-fit funding and partnership recommendations. Fit score measures alignment, not acceptance
              probability.
            </p>
          </div>
        </div>
        {topFunding.length + topPartners.length === 0 ? (
          <div className="border border-dashed border-foreground/20 bg-card px-6 py-10 text-center">
            <p className="text-sm font-medium">No opportunities above the relevance threshold yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              No suitable records were found in the current curated dataset for this profile. Adding detail to your
              profile can improve matching.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {topFunding.map((a) => (
              <FundingHighlightCard key={a.opportunity.id} assessment={a} />
            ))}
            {topPartners.map((a) => (
              <PartnerHighlightCard key={a.partner.id} assessment={a} />
            ))}
          </div>
        )}
      </section>

      <HowItWorks />
    </div>
  )
}
