import type { LucideIcon } from "lucide-react"
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  CircleHelp,
  CircleSlash,
  FileQuestion,
  FlaskConical,
  Lightbulb,
  Megaphone,
  ShieldCheck,
  Sparkles,
  UserRound,
  UserRoundSearch,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  ApplicationStatus,
  CorporatePartner,
  CriterionResult,
  EligibilityStatus,
  Evidence,
  FundingCategory,
  PartnershipCategory,
  PersonCategory,
  RecommendedPerson,
  TaskPriority,
  TaskStatus,
} from "@/lib/types"

export type PillTone = "neutral" | "info" | "teal" | "success" | "warning" | "danger"

const TONE_CLASS: Record<PillTone, string> = {
  neutral: "bg-secondary text-muted-foreground border-border",
  info: "bg-info-soft text-accent-foreground border-primary/15",
  teal: "bg-accent-teal-soft text-accent-teal border-accent-teal/15",
  success: "bg-success-soft text-success border-success/15",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/15",
}

export function Pill({
  tone = "neutral",
  icon: Icon,
  children,
  className,
  title,
}: {
  tone?: PillTone
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium leading-none",
        TONE_CLASS[tone],
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      {children}
    </span>
  )
}

export const FUNDING_CATEGORY_LABEL: Record<FundingCategory, string> = {
  grant: "Grant",
  investment: "Investment programme",
  accelerator: "Accelerator",
  government: "Government programme",
  challenge: "Innovation challenge",
}

export const PARTNERSHIP_CATEGORY_LABEL: Record<PartnershipCategory, string> = {
  commercial_pilot: "Commercial pilot",
  technology_integration: "Technology integration",
  distribution: "Distribution",
  supplier: "Supplier relationship",
  joint_development: "Joint product development",
  corporate_innovation: "Corporate innovation",
  market_expansion: "Market expansion",
}

export const PERSON_CATEGORY_LABEL: Record<PersonCategory, string> = {
  mentor: "Mentor",
  investor: "Investor",
  corporate_contact: "Corporate contact",
  programme_representative: "Programme representative",
  ecosystem_connector: "Ecosystem connector",
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
}

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
}

export function EligibilityBadge({ status, className }: { status: EligibilityStatus; className?: string }) {
  switch (status) {
    case "eligible":
      return (
        <Pill tone="success" icon={CheckCircle2} className={className} title="Every mandatory criterion is satisfied by your profile">
          Eligible
        </Pill>
      )
    case "potentially_eligible":
      return (
        <Pill tone="warning" icon={CircleDashed} className={className} title="Plausible fit, but at least one mandatory criterion needs confirmation">
          Potentially eligible
        </Pill>
      )
    case "not_eligible":
      return (
        <Pill tone="danger" icon={XCircle} className={className} title="A mandatory criterion is contradicted by your profile">
          Not eligible
        </Pill>
      )
    default:
      return (
        <Pill tone="neutral" icon={CircleHelp} className={className} title="Not enough evidence to assess eligibility">
          Needs verification
        </Pill>
      )
  }
}

function daysUntil(dateIso: string): number | null {
  const t = Date.parse(dateIso)
  if (Number.isNaN(t)) return null
  return Math.ceil((t - Date.now()) / 86_400_000)
}

export function ApplicationStatusBadge({
  status,
  deadline,
  className,
}: {
  status: ApplicationStatus
  deadline?: string
  className?: string
}) {
  const days = deadline ? daysUntil(deadline) : null
  if (status === "open" && days !== null && days >= 0 && days <= 30) {
    return (
      <Pill tone="warning" icon={CalendarClock} className={className}>
        Deadline approaching
      </Pill>
    )
  }
  switch (status) {
    case "open":
      return (
        <Pill tone="success" icon={CircleDot} className={className}>
          Open
        </Pill>
      )
    case "upcoming":
      return (
        <Pill tone="info" icon={CalendarClock} className={className}>
          Upcoming
        </Pill>
      )
    case "closed":
      return (
        <Pill tone="neutral" icon={CircleSlash} className={className}>
          Closed
        </Pill>
      )
    default:
      return (
        <Pill tone="neutral" icon={FileQuestion} className={className} title="No confirmed intake or deadline in the official source">
          Intake not confirmed
        </Pill>
      )
  }
}

export type ProvenanceKind =
  | "verified"
  | "needs_confirmation"
  | "illustrative"
  | "ai"
  | "potential"
  | "published"
  | "template"
  | "public_professional"

export function ProvenanceBadge({ kind, className }: { kind: ProvenanceKind; className?: string }) {
  switch (kind) {
    case "verified":
      return (
        <Pill tone="success" icon={ShieldCheck} className={className}>
          Verified source
        </Pill>
      )
    case "needs_confirmation":
      return (
        <Pill tone="warning" icon={CircleHelp} className={className}>
          Needs confirmation
        </Pill>
      )
    case "illustrative":
      return (
        <Pill tone="neutral" icon={FlaskConical} className={className}>
          Illustrative demo data
        </Pill>
      )
    case "ai":
      return (
        <Pill tone="info" icon={Sparkles} className={className}>
          AI-generated assessment
        </Pill>
      )
    case "potential":
      return (
        <Pill tone="teal" icon={Lightbulb} className={className}>
          Potential partnership
        </Pill>
      )
    case "published":
      return (
        <Pill tone="success" icon={Megaphone} className={className}>
          Published opportunity
        </Pill>
      )
    case "template":
      return (
        <Pill tone="neutral" icon={FlaskConical} className={className}>
          Demo intelligence
        </Pill>
      )
    default:
      return (
        <Pill tone="info" icon={BadgeCheck} className={className}>
          Public professional source
        </Pill>
      )
  }
}

export function OpportunityTypeBadge({
  type,
  className,
}: {
  type: CorporatePartner["opportunityType"]
  className?: string
}) {
  return <ProvenanceBadge kind={type === "published_opportunity" ? "published" : "potential"} className={className} />
}

export function ContactTypeBadge({
  type,
  className,
}: {
  type: RecommendedPerson["contactType"]
  className?: string
}) {
  return type === "verified_person" ? (
    <Pill tone="success" icon={UserRound} className={className}>
      Verified person
    </Pill>
  ) : (
    <Pill tone="neutral" icon={UserRoundSearch} className={className} title="A target role to look for, not a verified individual">
      Suggested contact role
    </Pill>
  )
}

export function CriterionResultBadge({ result, className }: { result: CriterionResult; className?: string }) {
  if (result === "meets")
    return (
      <Pill tone="success" icon={CheckCircle2} className={className}>
        Meets requirement
      </Pill>
    )
  if (result === "not_met")
    return (
      <Pill tone="danger" icon={XCircle} className={className}>
        Does not meet requirement
      </Pill>
    )
  return (
    <Pill tone="warning" icon={CircleHelp} className={className}>
      Needs confirmation
    </Pill>
  )
}

/** Compact one-line summary of the strongest evidence behind a record. */
export function EvidenceIndicator({ evidence, className }: { evidence: Evidence[]; className?: string }) {
  const verified = evidence.filter((e) => e.verificationStatus === "verified").length
  const pending = evidence.filter((e) => e.verificationStatus === "needs_confirmation").length
  const illustrative = evidence.filter((e) => e.verificationStatus === "illustrative").length
  let tone = "text-muted-foreground"
  let Icon: LucideIcon = FileQuestion
  let label = "No sources attached"
  if (verified > 0) {
    tone = "text-success"
    Icon = ShieldCheck
    label = `${verified} verified source${verified > 1 ? "s" : ""}`
    if (pending > 0) label += ` · ${pending} to confirm`
  } else if (pending > 0) {
    tone = "text-warning"
    Icon = CircleHelp
    label = `${pending} source${pending > 1 ? "s" : ""} need${pending > 1 ? "" : "s"} confirmation`
  } else if (illustrative > 0) {
    Icon = FlaskConical
    label = "Illustrative demo scenario"
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", tone, className)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  )
}
