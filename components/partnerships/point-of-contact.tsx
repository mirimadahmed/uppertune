"use client"

import Link from "next/link"
import { ArrowRight, Globe, Info, UserRoundSearch } from "lucide-react"
import { ContactTypeBadge, PARTNERSHIP_CATEGORY_LABEL } from "@/components/shared/badges"
import { ExternalLink, hostnameOf } from "@/components/shared/external-link"
import { Monogram, initialsOf } from "@/components/shared/monogram"
import { recommendedPeople } from "@/data/people"
import type { CorporatePartner } from "@/lib/types"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-foreground/85">{children}</div>
    </div>
  )
}

export function PointOfContact({ partner }: { partner: CorporatePartner }) {
  const related = recommendedPeople.filter((p) => p.relatedOpportunityId === partner.id)
  const verified = related.find((p) => p.contactType === "verified_person" && p.name)
  const suggested = related.find((p) => p.contactType === "suggested_role")

  if (verified && verified.name) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Monogram text={initialsOf(verified.name)} size="lg" tone="teal" />
            <div>
              <p className="text-lg font-semibold tracking-tight">{verified.name}</p>
              <p className="text-sm text-muted-foreground">
                {verified.role} · {verified.organisation}
              </p>
              <ContactTypeBadge type="verified_person" className="mt-2" />
            </div>
          </div>
          <Link
            href={`/app/people#${verified.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View in People
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Why this person is relevant">{verified.relevanceExplanation}</Field>
          <Field label="Recommended approach">{partner.contactApproach}</Field>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4">
          {verified.publicProfileUrl ? (
            <ExternalLink href={verified.publicProfileUrl}>Public professional profile</ExternalLink>
          ) : null}
          <ExternalLink href={partner.website}>Official website · {hostnameOf(partner.website)}</ExternalLink>
        </div>
      </div>
    )
  }

  const categoryLabel = PARTNERSHIP_CATEGORY_LABEL[partner.category].toLowerCase()

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border border-dashed border-foreground/25 bg-secondary/60 text-muted-foreground">
          <UserRoundSearch className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight">{partner.targetContactRole}</p>
          <p className="text-sm text-muted-foreground">{partner.name}</p>
          <ContactTypeBadge type="suggested_role" className="mt-2" />
        </div>
      </div>
      <div className="flex items-start gap-2.5 rounded-xl border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          <span className="font-medium text-foreground">Suggested contact role — not a verified person.</span> UpperTune
          could not verify a named individual from public sources, so it recommends the function to approach instead. It
          never invents names, email addresses or social profiles.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Why this role is relevant">
          {suggested?.relevanceExplanation ??
            `A ${categoryLabel} like the one proposed would typically be evaluated by this function, which is usually responsible for assessing new partners and pilots.`}
        </Field>
        <Field label="Recommended approach">{partner.contactApproach}</Field>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t pt-4">
        <span className="inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Globe className="size-3.5" aria-hidden />
          Confirm the right department via
          <ExternalLink href={partner.website}>{hostnameOf(partner.website)}</ExternalLink>
        </span>
        {suggested ? (
          <Link
            href={`/app/people#${suggested.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Draft an introduction in People
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  )
}
