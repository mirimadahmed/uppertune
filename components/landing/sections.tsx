import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileSearch,
  Handshake,
  Landmark,
  ListChecks,
  Route,
  ScanSearch,
  Sparkles,
  Telescope,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Wordmark } from "@/components/landing/logo";
import { UrlForm } from "@/components/landing/url-form";

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-display text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl">{title}</h2>
      {intro ? <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{intro}</p> : null}
    </div>
  );
}

const steps = [
  {
    icon: ScanSearch,
    title: "Business profile",
    body: "UpperTune reads the website you submit and Gemma 4 extracts your products, capabilities, markets and what is still unknown.",
  },
  {
    icon: Telescope,
    title: "Opportunity research",
    body: "Your profile is compared with a curated set of ASEAN funding programmes, corporate organisations and ecosystem contacts.",
  },
  {
    icon: BadgeCheck,
    title: "Fit assessment",
    body: "Deterministic eligibility checks show which criteria you meet, which you do not, and which still need confirmation.",
  },
  {
    icon: Route,
    title: "Action roadmap",
    body: "Recommendations become a prioritised plan with tailored pitches, proof-of-concept outlines and introduction drafts.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="How it works"
          title="From a single URL to a growth plan you can act on."
          intro="Every stage reflects a real operation: one page fetched, one structured profile, transparent matching and a roadmap you control."
        />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
                <step.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-8 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const outcomes = [
  {
    icon: Landmark,
    title: "Funding intelligence",
    body: "Grants, government programmes and accelerators ranked by relevance, with a criteria-by-criteria eligibility assessment and what to prepare.",
  },
  {
    icon: Handshake,
    title: "Partnership intelligence",
    body: "Corporate organisations whose documented priorities fit your capabilities, with a proposed pilot, a target contact role and a tailored pitch.",
  },
  {
    icon: UsersRound,
    title: "People who can help",
    body: "Mentors, programme representatives and ecosystem connectors, shown as verified people only when a public source confirms them.",
  },
  {
    icon: ListChecks,
    title: "An action plan",
    body: "A prioritised roadmap across funding, partnerships and network building that you can track from first step to submission.",
  },
];

export function WhatYouGet() {
  return (
    <section id="product" className="scroll-mt-20 border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Product"
          title="An intelligence layer, not another directory."
          intro="UpperTune explains why each opportunity fits, what is missing and what to do next."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {outcomes.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-background p-7">
              <span className="flex size-10 items-center justify-center rounded-xl bg-card text-primary ring-1 ring-border">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const provenance = [
  {
    label: "Verified source",
    tone: "bg-success-soft text-success",
    icon: BadgeCheck,
    body: "Stated on an official programme or organisation page, linked with the date it was checked.",
  },
  {
    label: "AI assessment",
    tone: "bg-primary/10 text-primary",
    icon: Sparkles,
    body: "Analysis and drafts produced by Gemma 4 from your profile. Useful guidance, never an official source.",
  },
  {
    label: "Potential partnership",
    tone: "bg-accent-teal-soft text-accent-teal",
    icon: Building2,
    body: "An opportunity UpperTune inferred from public business context. The organisation has not requested it.",
  },
  {
    label: "Illustrative",
    tone: "bg-warning-soft text-warning",
    icon: FileSearch,
    body: "Demo scenarios and assumptions, such as the fictional CanopyIQ startup, clearly labelled wherever they appear.",
  },
];

export function Provenance() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          eyebrow="Evidence first"
          title="You always know where an answer came from."
          intro="Deadlines, funding amounts and eligibility rules are only shown when a source supports them. Everything else is labelled as needing confirmation."
        />
        <ul className="grid gap-3">
          {provenance.map((item) => (
            <li key={item.label} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
              <span className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${item.tone}`}>
                <item.icon className="size-3.5" />
                {item.label}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const ecosystem = [
  { country: "Malaysia", orgs: ["Cradle Fund", "MDEC"] },
  { country: "Singapore", orgs: ["Enterprise Singapore", "Startup SG"] },
  { country: "Thailand", orgs: ["NIA Thailand"] },
  { country: "Indonesia", orgs: ["Expansion market in the demo scenario"] },
  { country: "Regional", orgs: ["Corporate innovation and pilot programmes"] },
];

export function Ecosystem() {
  return (
    <section id="ecosystem" className="scroll-mt-20 border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="ASEAN ecosystem"
          title="Built around the programmes founders in the region actually use."
          intro="The curated dataset references public information from organisations such as these. Naming them does not imply any partnership or endorsement."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {ecosystem.map((group) => (
            <div key={group.country} className="bg-background p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{group.country}</p>
              <ul className="mt-4 space-y-2">
                {group.orgs.map((org) => (
                  <li key={org} className="text-[15px] leading-snug text-foreground">
                    {org}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl items-end gap-12 px-6 py-24 lg:grid-cols-2">
        <div>
          <Eyebrow>Know your opportunities. Make them happen.</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-[56px]">
            Your startup&apos;s intelligence layer for funding, partnerships and growth across ASEAN.
          </h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <UrlForm showCaption={false} />
          <p className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground">
            No API key? The guided demo loads a complete workspace for the illustrative startup CanopyIQ.
          </p>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Opportunity intelligence for ASEAN startups. Verify all programme details with the official source before
            applying.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <Button asChild variant="outline" size="sm" className="rounded-full bg-card px-4">
            <Link href="/analyze?demo=1">
              Try the demo
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Built with Gemma 4 · Hackathon prototype · MIT licence
          </p>
        </div>
      </div>
    </footer>
  );
}
