"use client"

import { AlertCircle, ArrowUpRight, FlaskConical, Info, Lightbulb, PencilLine, Sparkles, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Pill } from "@/components/shared/badges"
import { Monogram, initialsOf } from "@/components/shared/monogram"
import { PageHeader } from "@/components/shared/page-header"
import { useEditProfile } from "@/components/app/edit-profile-dialog"
import { PROFILE_SOURCE_LABEL, describeAnalysis, urlHostname } from "@/components/app/workspace-meta"
import { DEMO_STARTUP_LABEL } from "@/data/demo-startup"
import { useWorkspace } from "@/lib/workspace"

function NotStated() {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className="italic">Not stated</span>
      <Pill tone="warning">Needs confirmation</Pill>
    </span>
  )
}

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return <NotStated />
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-md border bg-background px-2 py-0.5 text-[13px]">
          {i}
        </span>
      ))}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
      <dt className="eyebrow pt-1">{label}</dt>
      <dd className="min-w-0 text-sm leading-relaxed">{children}</dd>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card card-shadow">
      <h2 className="border-b px-5 py-4 text-base font-semibold tracking-tight md:px-6">{title}</h2>
      <dl className="divide-y px-5 py-5 md:px-6">{children}</dl>
    </section>
  )
}

export function ProfileView() {
  const { state, isDemo } = useWorkspace()
  const { openEditProfile } = useEditProfile()
  const p = state.profile
  const website = p.website ?? state.analysedUrl
  const notes = state.analysisNotes?.filter(Boolean) ?? []

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Startup profile"
        title={p.name}
        description={p.description}
        actions={
          <Button onClick={openEditProfile}>
            <PencilLine />
            Edit profile
          </Button>
        }
      />

      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 card-shadow sm:flex-row sm:items-center md:p-6">
        <Monogram text={initialsOf(p.name)} size="lg" tone={isDemo ? "ink" : "primary"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">Profile source</p>
            {state.profileSource === "demo" ? (
              <Pill tone="neutral" icon={FlaskConical}>
                {DEMO_STARTUP_LABEL}
              </Pill>
            ) : state.profileSource === "gemma" ? (
              <Pill tone="info" icon={Sparkles}>
                AI-extracted
              </Pill>
            ) : (
              <Pill tone="neutral" icon={UserRound}>
                Founder-provided
              </Pill>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{PROFILE_SOURCE_LABEL[state.profileSource]}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {describeAnalysis(state)}
          </p>
          {notes.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {notes.map((n) => (
                <li key={n} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {n}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {website ? (
          <Button variant="outline" size="sm" asChild>
            <a href={/^https?:\/\//i.test(website) ? website : `https://${website}`} target="_blank" rel="noopener noreferrer">
              {urlHostname(website)}
              <ArrowUpRight />
            </a>
          </Button>
        ) : null}
      </section>

      {p.missingInformation.length > 0 || p.assumptions.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {p.missingInformation.length > 0 ? (
            <section className="rounded-2xl border border-warning/20 bg-warning-soft/50 p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                  <div>
                    <h2 className="text-base font-semibold">What we still need from you</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Missing information keeps some eligibility checks at &ldquo;Needs confirmation&rdquo;.
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 bg-card" onClick={openEditProfile}>
                  Add details
                </Button>
              </div>
              <ul className="mt-4 space-y-2 pl-6.5">
                {p.missingInformation.map((m) => (
                  <li key={m} className="flex items-start gap-2 text-sm leading-snug">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
                    {m}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {p.assumptions.length > 0 ? (
            <section className="rounded-2xl border bg-card p-5 card-shadow md:p-6">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <h2 className="text-base font-semibold">Assumptions</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Inferred rather than stated. Correct anything that is wrong.
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 pl-6.5">
                {p.assumptions.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm leading-snug">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Business">
          <Row label="Industry">
            <Chips items={p.industry} />
          </Row>
          <Row label="Products">
            <Chips items={p.products} />
          </Row>
          <Row label="Business model">{p.businessModel ? p.businessModel : <NotStated />}</Row>
          <Row label="Target customers">
            <Chips items={p.targetCustomers} />
          </Row>
        </Panel>
        <Panel title="Company and markets">
          <Row label="Stage">{p.stage ? p.stage : <NotStated />}</Row>
          <Row label="Incorporation">{p.incorporationCountry ? p.incorporationCountry : <NotStated />}</Row>
          <Row label="Target markets">
            <Chips items={p.targetMarkets} />
          </Row>
          <Row label="Website">
            {p.website ? (
              <a
                href={/^https?:\/\//i.test(p.website) ? p.website : `https://${p.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
              >
                {urlHostname(p.website)}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            ) : (
              <NotStated />
            )}
          </Row>
        </Panel>
        <Panel title="Capabilities and technology">
          <Row label="Core capabilities">
            <Chips items={p.capabilities} />
          </Row>
          <Row label="Technologies">
            <Chips items={p.technologies} />
          </Row>
          <Row label="Competitive advantages">
            {p.competitiveAdvantages.length > 0 ? (
              <ul className="space-y-1.5">
                {p.competitiveAdvantages.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <NotStated />
            )}
          </Row>
        </Panel>
        <Panel title="Growth priorities">
          <Row label="Priorities">
            {p.growthPriorities.length > 0 ? (
              <ol className="space-y-1.5">
                {p.growthPriorities.map((g, i) => (
                  <li key={g} className="flex items-start gap-2.5">
                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    {g}
                  </li>
                ))}
              </ol>
            ) : (
              <NotStated />
            )}
          </Row>
        </Panel>
      </div>
    </div>
  )
}
