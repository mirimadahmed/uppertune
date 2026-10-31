"use client"

import Link from "next/link"
import { AlertCircle, FlaskConical, PencilLine, Sparkles, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Pill } from "@/components/shared/badges"
import { Monogram, initialsOf } from "@/components/shared/monogram"
import { useEditProfile } from "@/components/app/edit-profile-dialog"
import { DEMO_STARTUP_LABEL } from "@/data/demo-startup"
import { useWorkspace } from "@/lib/workspace"

function ChipList({ items, empty, max = 4 }: { items: string[]; empty: string; max?: number }) {
  if (items.length === 0) return <span className="text-sm text-muted-foreground italic">{empty}</span>
  const shown = items.slice(0, max)
  const rest = items.length - shown.length
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((item) => (
        <span key={item} className="rounded-md border bg-background px-2 py-0.5 text-[13px] text-foreground">
          {item}
        </span>
      ))}
      {rest > 0 ? <span className="px-1 py-0.5 text-[13px] text-muted-foreground">+{rest} more</span> : null}
    </div>
  )
}

export function ProfileSummaryCard() {
  const { state, isDemo } = useWorkspace()
  const { openEditProfile } = useEditProfile()
  const p = state.profile

  return (
    <section className="flex h-full flex-col rounded-2xl border bg-card card-shadow">
      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Monogram text={initialsOf(p.name)} size="lg" tone={isDemo ? "ink" : "primary"} />
          <div className="min-w-0">
            <p className="eyebrow mb-1.5">Startup profile</p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-3xl leading-none tracking-tight">{p.name}</h2>
              {isDemo ? (
                <Pill tone="neutral" icon={FlaskConical}>
                  {DEMO_STARTUP_LABEL}
                </Pill>
              ) : state.profileSource === "gemma" ? (
                <Pill tone="info" icon={Sparkles}>
                  Extracted by Gemma 4
                </Pill>
              ) : (
                <Pill tone="neutral" icon={UserRound}>
                  Founder description
                </Pill>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/profile">Full profile</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={openEditProfile}>
            <PencilLine />
            Edit profile
          </Button>
        </div>
        </div>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-foreground/80">{p.description}</p>
      </div>

      <dl className="grid gap-x-6 gap-y-5 border-t px-5 py-5 sm:grid-cols-2 md:px-6">
        <div>
          <dt className="eyebrow mb-2">Industry</dt>
          <dd>
            <ChipList items={p.industry} empty="Not stated" />
          </dd>
        </div>
        <div>
          <dt className="eyebrow mb-2">Markets</dt>
          <dd>
            <ChipList items={p.targetMarkets} empty="Not stated" />
          </dd>
        </div>
        <div>
          <dt className="eyebrow mb-2">Core capabilities</dt>
          <dd>
            <ChipList items={p.capabilities} empty="Not stated" />
          </dd>
        </div>
        <div>
          <dt className="eyebrow mb-2">Stage</dt>
          <dd className="text-sm">
            {p.stage ? (
              <span className="rounded-md border bg-background px-2 py-0.5 text-[13px]">{p.stage}</span>
            ) : (
              <span className="text-muted-foreground italic">Stage not stated</span>
            )}
          </dd>
        </div>
      </dl>

      {p.missingInformation.length > 0 ? (
        <div className="mx-5 mb-5 mt-auto rounded-xl border border-warning/20 bg-warning-soft/60 p-4 md:mx-6 md:mb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">What we still need from you</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  These gaps keep some eligibility checks at &ldquo;Needs confirmation&rdquo;.
                </p>
              </div>
            </div>
            <Button variant="link" size="sm" className="h-auto shrink-0 p-0 text-warning" onClick={openEditProfile}>
              Add details
            </Button>
          </div>
          <ul className="mt-3 grid gap-1.5 pl-6.5 sm:grid-cols-2">
            {p.missingInformation.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] leading-snug text-foreground/85">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
