"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Info, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterChips, type FilterOption } from "@/components/shared/filter-chips"
import { PageHeader } from "@/components/shared/page-header"
import { FundingCard } from "@/components/funding/funding-card"
import {
  APPLICATION_STATUS_LABEL,
  CATEGORY_CHIP_LABEL,
  CATEGORY_ORDER,
  ELIGIBILITY_LABEL,
} from "@/components/funding/labels"
import { FIT_SCORE_EXPLANATION, RELEVANCE_THRESHOLD } from "@/lib/matching"
import { useIntelligence } from "@/lib/workspace"
import type { ApplicationStatus, EligibilityStatus, FundingCategory } from "@/lib/types"
import { cn } from "@/lib/utils"

type CategoryFilter = "all" | FundingCategory
const ALL = "all"

export function FundingList() {
  const { funding } = useIntelligence()
  const [category, setCategory] = useState<CategoryFilter>("all")
  const [country, setCountry] = useState<string>(ALL)
  const [eligibility, setEligibility] = useState<string>(ALL)
  const [status, setStatus] = useState<string>(ALL)
  const [showLower, setShowLower] = useState(false)

  const countries = useMemo(
    () => Array.from(new Set(funding.map((a) => a.opportunity.country))).sort((a, b) => a.localeCompare(b)),
    [funding],
  )
  const eligibilityOptions = useMemo(
    () =>
      (Object.keys(ELIGIBILITY_LABEL) as EligibilityStatus[]).filter((s) => funding.some((a) => a.eligibility === s)),
    [funding],
  )
  const statusOptions = useMemo(
    () =>
      (Object.keys(APPLICATION_STATUS_LABEL) as ApplicationStatus[]).filter((s) =>
        funding.some((a) => a.opportunity.applicationStatus === s),
      ),
    [funding],
  )

  // Country / eligibility / status narrow the set; category chips then show counts within it.
  const narrowed = useMemo(
    () =>
      funding.filter(
        (a) =>
          (country === ALL || a.opportunity.country === country) &&
          (eligibility === ALL || a.eligibility === eligibility) &&
          (status === ALL || a.opportunity.applicationStatus === status),
      ),
    [funding, country, eligibility, status],
  )

  const chipOptions: FilterOption<CategoryFilter>[] = [
    { value: "all", label: "All", count: narrowed.length },
    ...CATEGORY_ORDER.filter((c) => c !== "challenge" || funding.some((a) => a.opportunity.category === "challenge")).map(
      (c) => ({
        value: c as CategoryFilter,
        label: CATEGORY_CHIP_LABEL[c],
        count: narrowed.filter((a) => a.opportunity.category === c).length,
      }),
    ),
  ]

  const filtered = category === "all" ? narrowed : narrowed.filter((a) => a.opportunity.category === category)
  const relevant = filtered.filter((a) => a.fitScore >= RELEVANCE_THRESHOLD)
  const lower = filtered.filter((a) => a.fitScore < RELEVANCE_THRESHOLD)
  const filtersActive = category !== "all" || country !== ALL || eligibility !== ALL || status !== ALL

  const resetFilters = () => {
    setCategory("all")
    setCountry(ALL)
    setEligibility(ALL)
    setStatus(ALL)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Funding"
        title="Funding intelligence"
        description="Funding programmes and investment opportunities that align with your startup."
      />

      <div className="space-y-4">
        <FilterChips options={chipOptions} value={category} onChange={setCategory} />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <FilterSelect label="Country" value={country} onChange={setCountry} allLabel="All countries">
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </FilterSelect>
          <FilterSelect label="Eligibility" value={eligibility} onChange={setEligibility} allLabel="Any eligibility">
            {eligibilityOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {ELIGIBILITY_LABEL[s]}
              </SelectItem>
            ))}
          </FilterSelect>
          <FilterSelect label="Application status" value={status} onChange={setStatus} allLabel="Any status">
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {APPLICATION_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </FilterSelect>
          {filtersActive ? (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground sm:ml-auto">
              <RotateCcw />
              Reset filters
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-y py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium">
          {relevant.length} relevant {relevant.length === 1 ? "programme" : "programmes"}
          {lower.length > 0 ? (
            <span className="font-normal text-muted-foreground"> · {lower.length} lower relevance</span>
          ) : null}
        </p>
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground sm:max-w-md">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{FIT_SCORE_EXPLANATION}</span>
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No suitable funding records found"
          description={
            funding.length === 0
              ? "The current curated dataset has no funding programmes to assess. UpperTune does not invent matches."
              : "No programmes in the current curated dataset match these filters. UpperTune does not invent matches — try widening your filters."
          }
          action={
            filtersActive ? (
              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw />
                Reset filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {relevant.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card px-6 py-8 text-center">
              <p className="text-sm font-medium">No programmes above the relevance threshold</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                The records below scored under {RELEVANCE_THRESHOLD} for your profile. They are shown for completeness,
                not as recommendations.
              </p>
            </div>
          ) : (
            relevant.map((a) => <FundingCard key={a.opportunity.id} assessment={a} />)
          )}

          {lower.length > 0 ? (
            <Collapsible open={showLower || relevant.length === 0} onOpenChange={setShowLower}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-xl border bg-card/60 px-5 py-3.5 text-left transition-colors hover:bg-card"
                >
                  <span>
                    <span className="block text-sm font-medium">Lower relevance ({lower.length})</span>
                    <span className="block text-xs text-muted-foreground">
                      Fit score below {RELEVANCE_THRESHOLD}. Weaker alignment with your current profile.
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      (showLower || relevant.length === 0) && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                {lower.map((a) => (
                  <FundingCard key={a.opportunity.id} assessment={a} muted />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  allLabel,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  allLabel: string
  children: React.ReactNode
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className={cn("h-9 w-full bg-card sm:w-auto sm:min-w-44", value !== ALL && "border-primary/40 text-accent-foreground")}
      >
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {children}
      </SelectContent>
    </Select>
  )
}
