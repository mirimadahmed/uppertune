"use client"

import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Clock,
  FileText,
  MapPin,
  SearchX,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ApplicationStatusBadge,
  CriterionResultBadge,
  EligibilityBadge,
  FUNDING_CATEGORY_LABEL,
  Pill,
  ProvenanceBadge,
} from "@/components/shared/badges"
import { CopyButton } from "@/components/shared/copy-button"
import { EmptyState } from "@/components/shared/empty-state"
import { EvidenceList } from "@/components/shared/evidence-list"
import { ExternalLink } from "@/components/shared/external-link"
import { FitFactors, FitScore } from "@/components/shared/fit-score"
import { GeneratedDocumentPanel } from "@/components/shared/generated-document"
import { SaveButton } from "@/components/shared/save-button"
import { SectionCard } from "@/components/shared/section-card"
import { PREPARATION_LABEL, PREPARATION_ORDER, roadmapStepKey } from "@/components/funding/labels"
import { FIT_SCORE_EXPLANATION } from "@/lib/matching"
import { useIntelligence, useWorkspace } from "@/lib/workspace"
import type { FundingAssessment, StartupProfile } from "@/lib/types"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "overview", label: "Programme overview" },
  { id: "match", label: "Why it matches" },
  { id: "eligibility", label: "Eligibility" },
  { id: "prepare", label: "What to prepare" },
  { id: "roadmap", label: "Roadmap" },
  { id: "strategy", label: "Strategy" },
  { id: "sources", label: "Sources" },
]

function profileText(p: StartupProfile) {
  return [
    p.description,
    ...p.industry,
    ...p.products,
    ...p.capabilities,
    ...p.technologies,
    ...p.targetCustomers,
    ...p.growthPriorities,
  ]
    .join(" ")
    .toLowerCase()
}

export function FundingDetail({ id }: { id: string }) {
  const { funding } = useIntelligence()
  const assessment = funding.find((a) => a.opportunity.id === id)

  if (!assessment) {
    return (
      <div className="animate-fade-up pt-6">
        <EmptyState
          icon={SearchX}
          title="Opportunity not found"
          description="This programme isn't in the current curated dataset. The link may be outdated or the record was removed."
          action={
            <Button asChild variant="outline">
              <Link href="/app/funding">
                <ArrowLeft />
                Back to funding intelligence
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return <FundingReport assessment={assessment} />
}

function FundingReport({ assessment }: { assessment: FundingAssessment }) {
  const o = assessment.opportunity

  return (
    <div className="space-y-6 animate-fade-up">
      <Link
        href="/app/funding"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Funding intelligence
      </Link>

      <header className="overflow-hidden rounded-2xl border bg-card card-shadow">
        <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <p className="eyebrow">
              Funding intelligence report · {FUNDING_CATEGORY_LABEL[o.category]}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">{o.title}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-muted-foreground">
              <span className="font-medium text-foreground">{o.organisation}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden />
                {o.country}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <EligibilityBadge status={assessment.eligibility} />
              <ApplicationStatusBadge status={o.applicationStatus} deadline={o.deadline} />
              {o.demoOnly ? <ProvenanceBadge kind="illustrative" /> : null}
            </div>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-foreground/85">{o.summary}</p>

            {o.fundingAmount || o.deadline ? (
              <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                {o.fundingAmount ? (
                  <div>
                    <dt className="eyebrow flex items-center gap-1.5">
                      <Banknote className="size-3.5" aria-hidden />
                      Funding
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">{o.fundingAmount}</dd>
                  </div>
                ) : null}
                {o.deadline ? (
                  <div>
                    <dt className="eyebrow flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" aria-hidden />
                      Deadline
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">{o.deadline}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <a href={o.officialUrl} target="_blank" rel="noopener noreferrer">
                  Visit official source
                  <ArrowUpRight />
                </a>
              </Button>
              <SaveButton id={o.id} variant="button" />
            </div>
          </div>

          <aside className="rounded-xl border bg-background/70 p-5">
            <div className="flex items-center gap-4">
              <FitScore score={assessment.fitScore} size="lg" />
              <div>
                <p className="text-sm font-semibold">Fit score</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Relevance, not acceptance probability.</p>
              </div>
            </div>
            <FitFactors factors={assessment.factors} className="mt-5" />
            <p className="mt-4 border-t pt-3 text-[11px] leading-relaxed text-muted-foreground">{FIT_SCORE_EXPLANATION}</p>
          </aside>
        </div>

        <nav aria-label="Report sections" className="flex gap-1 overflow-x-auto border-t bg-background/40 px-4 py-2 md:px-6">
          {SECTIONS.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              <span className="font-mono text-[10px] text-muted-foreground/70">{String(i + 1).padStart(2, "0")}</span>
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <OverviewSection assessment={assessment} />
      <MatchSection assessment={assessment} />
      <EligibilitySection assessment={assessment} />
      <PreparationSection assessment={assessment} />
      <RoadmapSection assessment={assessment} />

      <SectionCard
        id="strategy"
        index={6}
        title="Application strategy"
        description="AI-generated guidance tailored to your profile and this programme. Review before using it in an application."
        actions={<ProvenanceBadge kind="ai" />}
      >
        <GeneratedDocumentPanel
          kind="strategy"
          targetId={o.id}
          title={`Application strategy: ${o.title}`}
          description="Gemma 4 drafts positioning, strengths to emphasise and gaps to close for this programme."
          generateLabel="Generate application strategy"
        />
      </SectionCard>

      <SectionCard
        id="sources"
        index={7}
        title="Evidence and sources"
        description="Where each claim in this report comes from, and when it was last checked."
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={o.officialUrl} target="_blank" rel="noopener noreferrer">
              Visit official source
              <ArrowUpRight />
            </a>
          </Button>
        }
      >
        <EvidenceList evidence={o.evidence} />
      </SectionCard>
    </div>
  )
}

function Fact({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="eyebrow mb-1.5">{label}</dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  )
}

function OverviewSection({ assessment }: { assessment: FundingAssessment }) {
  const o = assessment.opportunity
  return (
    <SectionCard id="overview" index={1} title="Programme overview" description="What this programme is and who it serves.">
      <p className="max-w-3xl text-[15px] leading-relaxed">{o.description}</p>
      <dl className="mt-6 grid gap-x-8 gap-y-5 border-t pt-5 sm:grid-cols-2">
        <Fact label="Organisation">{o.organisation}</Fact>
        <Fact label="Country">{o.country}</Fact>
        <Fact label="Target beneficiaries">{o.targetBeneficiaries}</Fact>
        <Fact label="Funding structure">{o.fundingStructure}</Fact>
        {o.fundingAmount ? <Fact label="Funding amount">{o.fundingAmount}</Fact> : null}
        {o.deadline ? <Fact label="Deadline">{o.deadline}</Fact> : null}
        <Fact label="Official website" className="sm:col-span-2">
          <ExternalLink href={o.officialUrl} className="break-all">
            {o.officialUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </ExternalLink>
        </Fact>
      </dl>
    </SectionCard>
  )
}

function MatchSection({ assessment }: { assessment: FundingAssessment }) {
  const { state } = useWorkspace()
  const o = assessment.opportunity
  const p = state.profile
  const haystack = profileText(p)
  const keywords = o.focusKeywords.map((k) => ({ keyword: k, matched: haystack.includes(k.toLowerCase()) }))
  const matchedCount = keywords.filter((k) => k.matched).length

  return (
    <SectionCard
      id="match"
      index={2}
      title="Why this matches your startup"
      description={`How ${p.name}'s business connects to this programme's objectives.`}
    >
      {assessment.reasons.length > 0 ? (
        <ol className="space-y-3">
          {assessment.reasons.map((r, i) => (
            <li key={r} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-teal-soft font-mono text-[10px] font-medium text-accent-teal">
                {i + 1}
              </span>
              <span className="text-[15px] leading-relaxed">{r}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">
          The matching engine found no specific alignment signals between your profile and this programme.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-background/60 p-4">
          <p className="eyebrow mb-3">Your startup</p>
          <p className="text-sm font-semibold">{p.name}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[...p.industry, ...p.technologies.slice(0, 3)].map((t) => (
              <span key={t} className="rounded-md border bg-card px-2 py-0.5 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-background/60 p-4">
          <p className="eyebrow mb-3">Programme focus</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {matchedCount} of {keywords.length}
            </span>{" "}
            focus areas appear in your profile.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {keywords.map((k) => (
              <span
                key={k.keyword}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs",
                  k.matched
                    ? "border-accent-teal/20 bg-accent-teal-soft text-accent-teal"
                    : "bg-card text-muted-foreground",
                )}
              >
                {k.matched ? <Check className="size-3" aria-hidden /> : null}
                {k.keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

function EligibilitySection({ assessment }: { assessment: FundingAssessment }) {
  const criteria = assessment.criteria
  const met = criteria.filter((c) => c.result === "meets").length
  const unknown = criteria.filter((c) => c.result === "unknown").length
  const notMet = criteria.filter((c) => c.result === "not_met")
  const blocking = notMet.filter((c) => c.criterion.mandatory)

  return (
    <SectionCard
      id="eligibility"
      index={3}
      title="Eligibility assessment"
      description="Each criterion checked against your profile. Unknowns stay unknown until you confirm them."
      actions={<EligibilityBadge status={assessment.eligibility} />}
    >
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="size-4 text-success" aria-hidden />
          {met} met
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CircleHelp className="size-4 text-warning" aria-hidden />
          {unknown} need confirmation
        </span>
        <span className="inline-flex items-center gap-1.5">
          <XCircle className="size-4 text-danger" aria-hidden />
          {notMet.length} not met
        </span>
      </div>

      {criteria.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          The source does not list eligibility criteria. Confirm requirements directly with the programme.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table className="min-w-[760px]">
            <TableHeader className="bg-background/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[30%] pl-4">Requirement</TableHead>
                <TableHead className="w-[17%]">Assessment</TableHead>
                <TableHead className="w-[27%]">Explanation</TableHead>
                <TableHead className="w-[26%] pr-4">Evidence or missing information</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criteria.map((c) => (
                <TableRow key={c.criterion.id} className="align-top hover:bg-background/40">
                  <TableCell className="whitespace-normal py-3.5 pl-4">
                    <p className="font-medium leading-snug">{c.criterion.requirement}</p>
                    <p className="mt-1.5 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                      <span className={cn(c.criterion.mandatory && "font-medium text-foreground/70")}>
                        {c.criterion.mandatory ? "Mandatory" : "Optional"}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{c.criterion.basis === "official" ? "Official criterion" : "Suggested by UpperTune"}</span>
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-normal py-3.5">
                    <CriterionResultBadge result={c.result} />
                  </TableCell>
                  <TableCell className="whitespace-normal py-3.5 leading-relaxed text-foreground/85">
                    {c.explanation}
                  </TableCell>
                  <TableCell className="whitespace-normal py-3.5 pr-4 leading-relaxed text-muted-foreground">
                    {c.evidence}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {blocking.length > 0 ? (
        <Callout tone="danger" title="A mandatory requirement is not met">
          <ul className="mt-2 space-y-1">
            {blocking.map((c) => (
              <li key={c.criterion.id}>· {c.criterion.requirement}</li>
            ))}
          </ul>
        </Callout>
      ) : null}

      {assessment.unknowns.length > 0 ? (
        <Callout tone="warning" title="Not yet confirmed as eligible: confirm these mandatory requirements">
          <ul className="mt-2 space-y-1">
            {assessment.unknowns.map((u) => (
              <li key={u}>· {u}</li>
            ))}
          </ul>
        </Callout>
      ) : null}

      {assessment.eligibility === "eligible" ? (
        <Callout tone="success" title="Every mandatory criterion is satisfied by your profile">
          <p className="mt-1">Confirm the details against the official source before you apply.</p>
        </Callout>
      ) : null}
    </SectionCard>
  )
}

function Callout({
  tone,
  title,
  children,
}: {
  tone: "warning" | "danger" | "success"
  title: string
  children: React.ReactNode
}) {
  const styles = {
    warning: { box: "border-warning/20 bg-warning-soft/70", icon: <CircleAlert className="size-4 text-warning" /> },
    danger: { box: "border-danger/20 bg-danger-soft/70", icon: <XCircle className="size-4 text-danger" /> },
    success: { box: "border-success/20 bg-success-soft/70", icon: <CheckCircle2 className="size-4 text-success" /> },
  }[tone]
  return (
    <div className={cn("mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm", styles.box)}>
      <span className="mt-0.5 shrink-0" aria-hidden>
        {styles.icon}
      </span>
      <div className="leading-relaxed text-foreground/85">
        <p className="font-semibold text-foreground">{title}</p>
        {children}
      </div>
    </div>
  )
}

function PreparationSection({ assessment }: { assessment: FundingAssessment }) {
  const { state } = useWorkspace()
  const o = assessment.opportunity
  const groups = PREPARATION_ORDER.map((cat) => ({
    cat,
    items: o.preparation.filter((p) => p.category === cat),
  })).filter((g) => g.items.length > 0)
  const confirmedCount = o.preparation.filter((p) => p.confirmed).length

  const checklist = [
    `Application checklist: ${o.title}`,
    `${o.organisation} · ${o.country}`,
    `Prepared for ${state.profile.name} with UpperTune`,
    "",
    ...groups.flatMap((g) => [
      PREPARATION_LABEL[g.cat],
      ...g.items.map((i) => `[ ] ${i.item} (${i.confirmed ? "confirmed requirement" : "suggested preparation"})`),
      "",
    ]),
    ...(assessment.unknowns.length > 0
      ? ["Confirm before applying", ...assessment.unknowns.map((u) => `[ ] ${u}`), ""]
      : []),
    `Official source: ${o.officialUrl}`,
  ].join("\n")

  return (
    <SectionCard
      id="prepare"
      index={4}
      title="What you need to prepare"
      description={`${confirmedCount} confirmed by the official source · ${o.preparation.length - confirmedCount} suggested by UpperTune`}
      actions={
        o.preparation.length > 0 ? (
          <CopyButton text={checklist} label="Copy checklist" toastMessage="Checklist copied" variant="outline" size="sm" />
        ) : undefined
      }
    >
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No preparation items are recorded for this programme yet. Check the official source for application
          requirements.
        </p>
      ) : (
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.cat}>
              <p className="eyebrow mb-2.5">{PREPARATION_LABEL[g.cat]}</p>
              <ul className="space-y-2">
                {g.items.map((i) => (
                  <li key={i.item} className="flex items-start gap-3 rounded-lg border bg-background/50 px-3 py-2.5">
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1 text-sm leading-snug">{i.item}</span>
                    {i.confirmed ? (
                      <Pill tone="success" className="shrink-0">
                        Confirmed requirement
                      </Pill>
                    ) : (
                      <Pill tone="neutral" className="shrink-0">
                        Suggested preparation
                      </Pill>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

function RoadmapSection({ assessment }: { assessment: FundingAssessment }) {
  const { state, setTaskStatus } = useWorkspace()
  const o = assessment.opportunity
  const steps = o.roadmap.map((step, index) => {
    const key = roadmapStepKey(o.id, index)
    return { step, index, key, done: state.taskStatus[key] === "completed" }
  })
  const doneCount = steps.filter((s) => s.done).length
  const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0

  const toggle = (key: string, done: boolean) => {
    setTaskStatus(key, done ? "completed" : "not_started")
    toast.success(done ? "Task marked complete" : "Task reopened")
  }

  return (
    <SectionCard
      id="roadmap"
      index={5}
      title="Application roadmap"
      description="A practical sequence to get application-ready. Progress is saved in this workspace."
      actions={
        steps.length > 0 ? (
          <div className="flex min-w-44 items-center gap-3">
            <Progress value={pct} className="h-1.5" aria-label="Roadmap progress" />
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {doneCount}/{steps.length}
            </span>
          </div>
        ) : undefined
      }
    >
      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No roadmap steps are recorded for this programme yet.</p>
      ) : (
        <ol className="relative space-y-3">
          {steps.map(({ step, index, key, done }) => (
            <li
              key={key}
              className={cn(
                "flex gap-4 rounded-xl border p-4 transition-colors",
                done ? "border-success/20 bg-success-soft/40" : "bg-card",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium",
                  done ? "bg-success text-white" : "bg-secondary text-muted-foreground",
                )}
                aria-hidden
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className={cn("text-[15px] font-semibold leading-snug", done && "text-muted-foreground")}>
                    {step.task}
                  </p>
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
                    <Checkbox checked={done} onCheckedChange={(v) => toggle(key, v === true)} aria-label={`Mark "${step.task}" complete`} />
                    {done ? "Completed" : "Mark complete"}
                  </label>
                </div>
                <dl className="mt-2.5 grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
                  <div>
                    <dt className="eyebrow mb-0.5">Why it matters</dt>
                    <dd className="leading-relaxed text-foreground/85">{step.why}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow mb-0.5">Required information</dt>
                    <dd className="leading-relaxed text-foreground/85">{step.requiredInfo}</dd>
                  </div>
                </dl>
                {step.effort ? (
                  <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    Estimated effort: {step.effort}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  )
}
