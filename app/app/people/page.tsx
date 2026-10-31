"use client"

import { useEffect, useMemo, useState } from "react"
import { ShieldCheck, Target, Users } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterChips } from "@/components/shared/filter-chips"
import { PageHeader } from "@/components/shared/page-header"
import { PersonCard } from "@/components/people/person-card"
import { useIntelligence, useWorkspace } from "@/lib/workspace"
import type { PersonCategory } from "@/lib/types"

type CategoryFilter = "all" | PersonCategory

const CATEGORIES: { value: PersonCategory; label: string }[] = [
  { value: "mentor", label: "Mentors" },
  { value: "investor", label: "Investors" },
  { value: "corporate_contact", label: "Corporate contacts" },
  { value: "programme_representative", label: "Programme representatives" },
  { value: "ecosystem_connector", label: "Ecosystem connectors" },
]

export default function PeoplePage() {
  const { people } = useIntelligence()
  const { state } = useWorkspace()
  const [category, setCategory] = useState<CategoryFilter>("all")
  const [highlighted, setHighlighted] = useState<string | null>(null)

  const options = useMemo(
    () => [
      { value: "all" as CategoryFilter, label: "All", count: people.length },
      ...CATEGORIES.map((c) => ({
        value: c.value as CategoryFilter,
        label: c.label,
        count: people.filter((p) => p.person.category === c.value).length,
      })).filter((o) => o.count > 0),
    ],
    [people],
  )

  const visible = category === "all" ? people : people.filter((p) => p.person.category === category)
  const verifiedCount = people.filter((p) => p.person.contactType === "verified_person" && p.person.name).length
  const roleCount = people.length - verifiedCount
  const needs = state.profile.growthPriorities.slice(0, 4)

  // Deep links (/app/people#<id>): content renders after hydration, so scroll + highlight manually.
  useEffect(() => {
    let timer: number | undefined
    const focusHash = () => {
      const target = decodeURIComponent(window.location.hash.slice(1))
      if (!target) return
      setCategory("all")
      window.requestAnimationFrame(() => {
        const el = document.getElementById(target)
        if (!el) return
        el.scrollIntoView({ behavior: "smooth", block: "start" })
        setHighlighted(target)
        window.clearTimeout(timer)
        timer = window.setTimeout(() => setHighlighted(null), 2600)
      })
    }
    focusHash()
    window.addEventListener("hashchange", focusHash)
    return () => {
      window.removeEventListener("hashchange", focusHash)
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="People"
        title="People who can move you forward"
        description="Discover relevant mentors, investors and ecosystem contacts based on your startup's current needs."
        actions={
          <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" aria-hidden />
            UpperTune never sends messages on your behalf.
          </p>
        }
      />

      {people.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No recommendations yet"
          description="No relevant people or contact roles were found in the current dataset for this profile. UpperTune never invents people."
        />
      ) : (
        <>
          <div className="grid gap-px overflow-hidden rounded-2xl border bg-border card-shadow md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="bg-card px-5 py-4">
              <p className="eyebrow flex items-center gap-1.5">
                <Target className="size-3.5" aria-hidden />
                Matched to {state.profile.name}&apos;s current needs
              </p>
              {needs.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {needs.map((n) => (
                    <span key={n} className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Add growth priorities to your profile to sharpen these recommendations.</p>
              )}
            </div>
            <div className="flex items-center gap-6 bg-card px-5 py-4">
              <div>
                <p className="font-display text-3xl leading-none">{verifiedCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">Verified {verifiedCount === 1 ? "person" : "people"}</p>
              </div>
              <div className="h-10 w-px bg-border" aria-hidden />
              <div>
                <p className="font-display text-3xl leading-none">{roleCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">Suggested contact {roleCount === 1 ? "role" : "roles"}</p>
              </div>
            </div>
          </div>

          <FilterChips options={options} value={category} onChange={setCategory} />

          <div className="space-y-5">
            {visible.map((a) => (
              <PersonCard key={a.person.id} assessment={a} highlighted={highlighted === a.person.id} />
            ))}
          </div>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Names appear only when a public official or professional source verifies them. Otherwise UpperTune recommends
            a contact role. No email addresses, phone numbers or social profiles are generated.
          </p>
        </>
      )}
    </div>
  )
}
