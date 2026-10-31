"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Handshake, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PARTNERSHIP_CATEGORY_LABEL } from "@/components/shared/badges"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterChips } from "@/components/shared/filter-chips"
import { PageHeader } from "@/components/shared/page-header"
import { OpportunityTypeLegend } from "@/components/partnerships/opportunity-type-legend"
import { PartnerCard } from "@/components/partnerships/partner-card"
import { RELEVANCE_THRESHOLD } from "@/lib/matching"
import { useIntelligence, useWorkspace } from "@/lib/workspace"
import type { CorporatePartner, PartnershipCategory } from "@/lib/types"

type TypeFilter = "all" | CorporatePartner["opportunityType"]

const CATEGORY_ORDER: PartnershipCategory[] = [
  "commercial_pilot",
  "technology_integration",
  "distribution",
  "supplier",
  "joint_development",
  "corporate_innovation",
  "market_expansion",
]

export default function PartnershipsPage() {
  const { partners } = useIntelligence()
  const { state } = useWorkspace()
  const [type, setType] = useState<TypeFilter>("all")
  const [category, setCategory] = useState<string>("all")
  const [country, setCountry] = useState<string>("all")
  const [showLow, setShowLow] = useState(false)

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((c) => partners.some((a) => a.partner.category === c)),
    [partners],
  )
  const countries = useMemo(
    () => Array.from(new Set(partners.map((a) => a.partner.country))).sort((a, b) => a.localeCompare(b)),
    [partners],
  )

  // Category + country narrow the set first so the type chip counts match what is shown.
  const scoped = useMemo(
    () =>
      partners.filter(
        (a) =>
          (category === "all" || a.partner.category === category) &&
          (country === "all" || a.partner.country === country),
      ),
    [partners, category, country],
  )
  const filtered = useMemo(
    () => scoped.filter((a) => type === "all" || a.partner.opportunityType === type),
    [scoped, type],
  )
  const relevant = filtered.filter((a) => a.fitScore >= RELEVANCE_THRESHOLD)
  const lowRelevance = filtered.filter((a) => a.fitScore < RELEVANCE_THRESHOLD)

  const typeOptions: { value: TypeFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: scoped.length },
    {
      value: "published_opportunity",
      label: "Published opportunities",
      count: scoped.filter((a) => a.partner.opportunityType === "published_opportunity").length,
    },
    {
      value: "potential_partnership",
      label: "Potential partnerships",
      count: scoped.filter((a) => a.partner.opportunityType === "potential_partnership").length,
    },
  ]

  const filtersActive = type !== "all" || category !== "all" || country !== "all"
  const clearFilters = () => {
    setType("all")
    setCategory("all")
    setCountry("all")
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Partnerships"
        title="Partnership intelligence"
        description="Discover organisations that could become your next customers, commercial partners or POC collaborators."
      />

      <OpportunityTypeLegend />

      {partners.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No partnership records yet"
          description="No suitable organisations were found in the current dataset for this profile. UpperTune doesn't invent matches."
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <FilterChips options={typeOptions} value={type} onChange={setType} />
            <div className="flex flex-wrap items-center gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 min-w-48 bg-card" aria-label="Filter by partnership category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {PARTNERSHIP_CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-9 min-w-40 bg-card" aria-label="Filter by country">
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filtersActive ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={
                type === "published_opportunity"
                  ? "No published opportunities in this view"
                  : "No organisations match these filters"
              }
              description={
                type === "published_opportunity"
                  ? "None of these organisations has a published challenge, RFP or programme confirmed by a source. The matches shown under Potential partnerships are strategic fits inferred by UpperTune."
                  : "Try a different partnership type, category or country to see more organisations."
              }
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{relevant.length}</span>{" "}
                  {relevant.length === 1 ? "organisation" : "organisations"} relevant to {state.profile.name}, ranked by
                  fit score
                </p>
              </div>

              {relevant.length > 0 ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  {relevant.map((a) => (
                    <PartnerCard key={a.partner.id} assessment={a} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Handshake}
                  title="No strong matches in this view"
                  description={`None of the organisations shown here reach the relevance threshold of ${RELEVANCE_THRESHOLD}. Lower-relevance organisations are listed below.`}
                />
              )}

              {lowRelevance.length > 0 ? (
                <Collapsible open={showLow} onOpenChange={setShowLow} className="rounded-2xl border bg-card/60">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-card md:px-6"
                    >
                      <span>
                        <span className="block text-sm font-semibold">
                          Lower relevance ({lowRelevance.length})
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          Scored below {RELEVANCE_THRESHOLD} for the current profile. Shown for completeness.
                        </span>
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${showLow ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid gap-5 border-t px-5 py-5 md:px-6 lg:grid-cols-2">
                      {lowRelevance.map((a) => (
                        <PartnerCard key={a.partner.id} assessment={a} muted />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  )
}
