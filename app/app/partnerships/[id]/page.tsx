"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CircleCheck,
  Factory,
  Info,
  Lightbulb,
  MapPin,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { OpportunityTypeBadge, PARTNERSHIP_CATEGORY_LABEL, Pill } from "@/components/shared/badges"
import { EmptyState } from "@/components/shared/empty-state"
import { EvidenceList } from "@/components/shared/evidence-list"
import { FitFactors, FitScore } from "@/components/shared/fit-score"
import { GeneratedDocumentPanel } from "@/components/shared/generated-document"
import { Monogram } from "@/components/shared/monogram"
import { SaveButton } from "@/components/shared/save-button"
import { SectionCard } from "@/components/shared/section-card"
import { OrganisationOverview } from "@/components/partnerships/organisation-overview"
import { PointOfContact } from "@/components/partnerships/point-of-contact"
import { PreparationChecklist, usePrepProgress } from "@/components/partnerships/preparation-checklist"
import { FIT_SCORE_EXPLANATION } from "@/lib/matching"
import { useIntelligence, useWorkspace } from "@/lib/workspace"
import type { CorporatePartner, PartnerAssessment } from "@/lib/types"

const SECTIONS = [
  { id: "overview", label: "Organisation overview" },
  { id: "why", label: "Why this partnership makes sense" },
  { id: "collaboration", label: "Potential collaboration" },
  { id: "contact", label: "Recommended point of contact" },
  { id: "pitch", label: "Tailored partnership pitch" },
  { id: "poc", label: "POC proposal generator" },
  { id: "checklist", label: "Preparation checklist" },
  { id: "evidence", label: "Evidence and sources" },
] as const

export default function PartnershipDetailPage() {
  const params = useParams<{ id: string }>()
  const id = decodeURIComponent(params?.id ?? "")
  const { partners } = useIntelligence()
  const assessment = partners.find((a) => a.partner.id === id)

  if (!assessment) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState
          icon={Building2}
          title="Organisation not found"
          description="This organisation isn't in the current partnership dataset. The link may be outdated or the record may have been removed."
          action={
            <Button asChild>
              <Link href="/app/partnerships">Browse partnership intelligence</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return <PartnershipDetail assessment={assessment} />
}

function BackLink() {
  return (
    <Link
      href="/app/partnerships"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Partnership intelligence
    </Link>
  )
}

function PartnershipDetail({ assessment }: { assessment: PartnerAssessment }) {
  const { partner, fitScore, factors, reasons } = assessment
  const { state } = useWorkspace()
  const startup = state.profile.name
  const categoryLabel = PARTNERSHIP_CATEGORY_LABEL[partner.category]
  const published = partner.opportunityType === "published_opportunity"

  return (
    <div className="space-y-6">
      <BackLink />

      <header className="rounded-2xl border bg-card p-5 card-shadow md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            <Monogram text={partner.monogram} size="lg" tone="primary" />
            <div className="min-w-0">
              <p className="eyebrow">Partnership intelligence</p>
              <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight md:text-[2.75rem]">
                {partner.name}
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden />
                  {partner.country}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Factory className="size-4" aria-hidden />
                  {partner.industry}
                </span>
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <OpportunityTypeBadge type={partner.opportunityType} />
                <Pill>{categoryLabel}</Pill>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <SaveButton id={partner.id} variant="button" />
            <Button asChild size="sm">
              <a href={partner.website} target="_blank" rel="noopener noreferrer">
                Visit official website
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <aside className="order-first space-y-4 lg:sticky lg:top-24 lg:order-none lg:col-start-2 lg:row-start-1">
          <div className="rounded-2xl border bg-card p-5 card-shadow">
            <p className="eyebrow">Fit score</p>
            <FitScore score={fitScore} size="lg" label className="mt-3" />
            {factors.length > 0 ? <FitFactors factors={factors} className="mt-5 border-t pt-5" /> : null}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{FIT_SCORE_EXPLANATION}</p>
          </div>
          <SectionNav partner={partner} />
        </aside>

        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
          <SectionCard id="overview" index={1} title="Organisation overview" description="What the organisation does and what it has publicly prioritised.">
            <OrganisationOverview partner={partner} />
          </SectionCard>

          <SectionCard
            id="why"
            index={2}
            title="Why this partnership makes sense"
            description={`The specific strategic connection between ${startup} and ${partner.name}.`}
          >
            <p className="max-w-3xl text-[15px] leading-relaxed text-foreground/90">{partner.strategicFit}</p>
            {reasons.length > 0 ? (
              <ul className="mt-5 space-y-2.5">
                {reasons.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-sm leading-relaxed">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent-teal" aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div
              className={
                published
                  ? "mt-5 flex items-start gap-2.5 rounded-xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success"
                  : "mt-5 flex items-start gap-2.5 rounded-xl border border-accent-teal/15 bg-accent-teal-soft px-4 py-3 text-sm text-accent-teal"
              }
            >
              {published ? (
                <Megaphone className="mt-0.5 size-4 shrink-0" aria-hidden />
              ) : (
                <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
              )}
              <p>
                {published
                  ? `${partner.name} has published a challenge, RFP or programme relevant to this collaboration. See the evidence in section 8.`
                  : `This is a strategic fit inferred by UpperTune. ${partner.name} has not necessarily requested this collaboration or expressed buying intent — treat it as a hypothesis to validate.`}
              </p>
            </div>
          </SectionCard>

          <SectionCard
            id="collaboration"
            index={3}
            title="Potential collaboration"
            description={`A proposal for discussion — not agreed with ${partner.name}.`}
          >
            <CollaborationGrid partner={partner} categoryLabel={categoryLabel} />
          </SectionCard>

          <SectionCard
            id="contact"
            index={4}
            title="Recommended point of contact"
            description="Who to approach, and how. Names appear only when verified by a public source."
          >
            <PointOfContact partner={partner} />
          </SectionCard>

          <SectionCard
            id="pitch"
            index={5}
            title="Tailored partnership pitch"
            description={`Built from ${startup}'s capabilities and ${partner.name}'s documented business context.`}
          >
            <GeneratedDocumentPanel
              kind="pitch"
              targetId={partner.id}
              title={`Pitch to ${partner.name}`}
              description="Opening, business problem, solution, value to the organisation, suggested POC and next step."
              generateLabel="Generate tailored pitch"
            />
          </SectionCard>

          <SectionCard
            id="poc"
            index={6}
            title="POC proposal generator"
            description="A concise proof-of-concept outline. Timelines are illustrative unless confirmed."
          >
            <GeneratedDocumentPanel
              kind="poc"
              targetId={partner.id}
              title="POC proposal"
              description="Objective, implementation, scope, success metrics, stakeholders, illustrative timeline and next steps."
              generateLabel="Generate POC outline"
            />
          </SectionCard>

          <SectionCard
            id="checklist"
            index={7}
            title="Partnership preparation checklist"
            description="Track your preparation. Progress is saved in this browser."
          >
            <PreparationChecklist partner={partner} />
          </SectionCard>

          <SectionCard
            id="evidence"
            index={8}
            title="Evidence and sources"
            description="Original organisation sources supporting this assessment."
          >
            <EvidenceList evidence={partner.evidence} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function CollaborationGrid({ partner, categoryLabel }: { partner: CorporatePartner; categoryLabel: string }) {
  const c = partner.collaboration
  const blocks: { label: string; body: React.ReactNode }[] = [
    { label: "Type of partnership", body: <span className="font-medium">{categoryLabel}</span> },
    { label: "Business problem", body: c.problem },
    { label: "Proposed solution", body: c.solution },
    { label: "Suggested pilot scope", body: c.pilotScope },
    { label: "Expected business value", body: c.businessValue },
    {
      label: "Proposed success metrics",
      body: (
        <ul className="space-y-1.5">
          {c.successMetrics.map((m) => (
            <li key={m} className="flex items-start gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ]
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-2">
      {blocks.map((b) => (
        <div key={b.label} className="bg-card px-4 py-4 md:px-5">
          <p className="eyebrow">{b.label}</p>
          <div className="mt-2 text-sm leading-relaxed text-foreground/85">{b.body}</div>
        </div>
      ))}
    </div>
  )
}

function SectionNav({ partner }: { partner: CorporatePartner }) {
  const { done, total } = usePrepProgress(partner)
  return (
    <nav aria-label="On this page" className="hidden rounded-2xl border bg-card p-5 card-shadow lg:block">
      <p className="eyebrow">On this page</p>
      <ol className="mt-3 space-y-0.5">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate">{s.label}</span>
              {s.id === "checklist" ? (
                <span className="font-mono text-[11px] tabular-nums">
                  {done}/{total}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        UpperTune never sends messages on your behalf. Everything here is for you to review and send yourself.
      </div>
    </nav>
  )
}
