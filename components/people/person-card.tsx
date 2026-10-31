"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Building2, ChevronDown, CircleCheck, MapPin, MessageSquareQuote, UserRoundSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContactTypeBadge, EvidenceIndicator, PERSON_CATEGORY_LABEL, Pill } from "@/components/shared/badges"
import { ExternalLink } from "@/components/shared/external-link"
import { GeneratedDocumentPanel } from "@/components/shared/generated-document"
import { Monogram, initialsOf } from "@/components/shared/monogram"
import { resolveRelated } from "@/components/roadmap/related"
import { cn } from "@/lib/utils"
import type { PersonAssessment } from "@/lib/types"

export function PersonCard({ assessment, highlighted = false }: { assessment: PersonAssessment; highlighted?: boolean }) {
  const { person, reasons } = assessment
  const [open, setOpen] = useState(false)
  const verifiedName = person.contactType === "verified_person" && person.name ? person.name : null
  const related = resolveRelated(person.relatedOpportunityId)
  const extraReasons = reasons.filter((r) => r !== person.relevanceExplanation)

  return (
    <article
      id={person.id}
      className={cn(
        "scroll-mt-24 rounded-2xl border bg-card card-shadow transition-[box-shadow,border-color] duration-500",
        highlighted && "border-primary/40 ring-4 ring-primary/10",
      )}
    >
      <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            {verifiedName ? (
              <Monogram text={initialsOf(verifiedName)} size="lg" tone="teal" />
            ) : (
              <span
                className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border border-dashed border-foreground/25 bg-secondary/60 text-muted-foreground"
                aria-hidden
              >
                <UserRoundSearch className="size-6" />
              </span>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Pill>{PERSON_CATEGORY_LABEL[person.category]}</Pill>
                <ContactTypeBadge type={verifiedName ? "verified_person" : "suggested_role"} />
              </div>
              <h3 className="mt-2.5 text-lg font-semibold leading-snug tracking-tight">{verifiedName ?? person.role}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {verifiedName ? person.role : "A target role to look for — not a verified individual"}
              </p>
              <p className="mt-2 flex flex-wrap items-start gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-start gap-1">
                  <Building2 className="mt-[3px] size-3.5 shrink-0" aria-hidden />
                  {person.organisation}
                </span>
                <span className="inline-flex items-start gap-1">
                  <MapPin className="mt-[3px] size-3.5 shrink-0" aria-hidden />
                  {person.country}
                </span>
              </p>
            </div>
          </div>

          {person.expertise.length > 0 ? (
            <div className="mt-5">
              <p className="eyebrow">Expertise</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {person.expertise.map((e) => (
                  <span key={e} className="rounded-md border bg-secondary/50 px-2 py-0.5 text-xs font-medium text-foreground/80">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border bg-background/60 p-4">
            <p className="eyebrow">{verifiedName ? "Why this person?" : "Why this role?"}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{person.relevanceExplanation}</p>
            {extraReasons.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {extraReasons.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/80">
                    <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-accent-teal" aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div>
            <p className="eyebrow">Reason to connect</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{person.reasonToConnect}</p>
          </div>
          {related ? (
            <div>
              <p className="eyebrow">Related opportunity</p>
              <Link
                href={related.href}
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {related.name}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              <span className="ml-2 text-xs text-muted-foreground">{related.kindLabel}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5 md:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <EvidenceIndicator evidence={person.evidence} />
          {person.publicProfileUrl ? (
            <ExternalLink href={person.publicProfileUrl}>
              {verifiedName ? "Public professional profile" : "Official organisation page"}
            </ExternalLink>
          ) : null}
        </div>
        <Button
          type="button"
          variant={open ? "secondary" : "outline"}
          size="sm"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`${person.id}-intro`}
        >
          <MessageSquareQuote aria-hidden />
          Suggested introduction
          <ChevronDown className={cn("transition-transform duration-200", open && "rotate-180")} aria-hidden />
        </Button>
      </div>

      {open ? (
        <div id={`${person.id}-intro`} className="animate-fade-up border-t bg-background/50 px-5 py-5 md:px-6">
          <GeneratedDocumentPanel
            kind="intro"
            targetId={person.id}
            title="Suggested introduction"
            description="A short, personalised introduction request for you to review, edit and send yourself."
            generateLabel="Draft introduction"
            autoGenerate
          />
        </div>
      ) : null}
    </article>
  )
}
