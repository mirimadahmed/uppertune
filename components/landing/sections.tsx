"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Building2, FileSearch, Handshake, Landmark, ListChecks, Sparkles, UsersRound } from "lucide-react";
import { AnimatedTetrahedron } from "@/components/landing/animated-tetrahedron";
import { AnimatedWave } from "@/components/landing/animated-wave";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Wordmark } from "@/components/landing/logo";
import { ProductPreview } from "@/components/landing/product-preview";
import { UrlForm } from "@/components/landing/url-form";
import { useInView } from "@/components/landing/use-in-view";
import { corporatePartners } from "@/data/corporate-partners";
import { fundingOpportunities } from "@/data/funding-opportunities";
import { recommendedPeople } from "@/data/people";
import { cn } from "@/lib/utils";

const reveal = (visible: boolean, from = "translate-y-8") =>
  `transition-all duration-700 ${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${from}`}`;
const h2 = "font-display text-4xl tracking-tight lg:text-6xl";

const outcomes = [
  { icon: Landmark, title: "Funding intelligence", body: "Grants, government programmes and accelerators ranked by relevance, with a criteria-by-criteria eligibility assessment and what to prepare." },
  { icon: Handshake, title: "Partnership intelligence", body: "Corporate organisations whose documented priorities fit your capabilities, with a proposed pilot, a target contact role and a tailored pitch." },
  { icon: UsersRound, title: "People who can help", body: "Mentors, programme representatives and ecosystem connectors, shown as verified people only when a public source confirms them." },
  { icon: ListChecks, title: "An action plan", body: "A prioritised roadmap across funding, partnerships and network building that you can track from first step to submission." },
];

export function ProductSection() {
  const [ref, visible] = useInView<HTMLElement>(0.1);
  return (
    <section id="product" ref={ref} className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className={`mb-14 flex flex-col gap-8 lg:mb-20 lg:flex-row lg:items-end lg:justify-between ${reveal(visible, "translate-y-4")}`}>
          <div>
            <Eyebrow className="mb-6">Product</Eyebrow>
            <h2 className={h2}>
              An intelligence layer,
              <br />
              <span className="text-muted-foreground">not another directory.</span>
            </h2>
          </div>
          <p className="max-w-md text-xl leading-relaxed text-muted-foreground">
            UpperTune explains why each opportunity fits, what is missing and what to do next.
          </p>
        </div>

        <div className={`${reveal(visible)} delay-150`}>
          <ProductPreview />
        </div>

        <div className="mt-24 flex items-center gap-4 lg:mt-32">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">What you get</span>
          <span className="h-px flex-1 bg-foreground/10" />
          <span className="font-mono text-xs text-muted-foreground">04</span>
        </div>
        <div className="mt-8 grid gap-px border border-foreground/10 bg-foreground/10 md:grid-cols-2 lg:grid-cols-4">
          {outcomes.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-background p-8 lg:p-10 ${reveal(visible)}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span className="flex size-10 items-center justify-center border border-foreground/10 transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="size-5" />
                </span>
              </div>
              <h3 className="mt-12 font-display text-3xl leading-tight tracking-tight transition-transform duration-500 group-hover:translate-x-2">
                {item.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "I",
    title: "Business profile",
    body: "UpperTune reads the website you submit and Gemma 4 extracts your products, capabilities, markets and what is still unknown.",
    file: "profile.json",
    code: `{
  "name": "CanopyIQ",
  "industry": ["AgriTech", "ClimateTech", "AI"],
  "markets": ["Malaysia", "Indonesia", "Singapore"],
  "stage": "Early-stage",
  "unknown": ["incorporation", "revenue", "IP"]
}`,
  },
  {
    number: "II",
    title: "Opportunity research",
    body: "Your profile is compared with a curated set of ASEAN funding programmes, corporate organisations and ecosystem contacts.",
    file: "research.log",
    code: `compare profile -> curated ASEAN dataset

  funding programmes        ${fundingOpportunities.length}
  corporate organisations   ${corporatePartners.length}
  ecosystem contacts        ${recommendedPeople.length}

shortlist ranked by relevance`,
  },
  {
    number: "III",
    title: "Fit assessment",
    body: "Deterministic eligibility checks show which criteria you meet, which you do not, and which still need confirmation.",
    file: "assessment.txt",
    code: `Technology commercialisation grant

  [met]      technology company
  [confirm]  incorporated in Malaysia
  [confirm]  company age under 7 years

fit 82 / 100 - potentially eligible`,
  },
  {
    number: "IV",
    title: "Action roadmap",
    body: "Recommendations become a prioritised plan with tailored pitches, proof-of-concept outlines and introduction drafts.",
    file: "roadmap.md",
    code: `## Next steps

[ ] Confirm incorporation details      high
[ ] Prepare a commercialisation roadmap high
[ ] Develop a pilot proposal           high
[ ] Request a programme officer call   high`,
  },
];

const codeStyles = `
.ut-code-line{opacity:0;transform:translateX(-8px);animation:utLine .4s cubic-bezier(.22,1,.36,1) forwards}
@keyframes utLine{to{opacity:1;transform:translateX(0)}}
.ut-code-char{opacity:0;filter:blur(8px);animation:utChar .3s cubic-bezier(.22,1,.36,1) forwards}
@keyframes utChar{to{opacity:1;filter:blur(0)}}
`;

export function HowItWorks() {
  const [ref, visible] = useInView<HTMLElement>(0.1);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => setActiveStep((prev) => (prev + 1) % steps.length), 5000);
    return () => clearTimeout(timeout);
  }, [visible, activeStep]);

  const step = steps[activeStep];
  return (
    <section id="how-it-works" ref={ref} className="relative scroll-mt-20 overflow-hidden bg-primary py-24 text-primary-foreground lg:py-32">
      <style dangerouslySetInnerHTML={{ __html: codeStyles }} />
      <div className="diagonal-lines pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <Eyebrow inverted className="mb-6 text-primary-foreground/60">How it works</Eyebrow>
          <h2 className={`${h2} ${reveal(visible, "translate-y-4")}`}>
            From a single URL
            <br />
            <span className="text-primary-foreground/55">to a growth plan you can act on.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/70">
            Every stage reflects a real operation: one page fetched, one structured profile, transparent matching and a
            roadmap you control.
          </p>
        </div>

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            {steps.map((item, index) => (
              <button
                key={item.number}
                type="button"
                onClick={() => setActiveStep(index)}
                aria-pressed={activeStep === index}
                className={cn(
                  "group w-full border-b border-primary-foreground/15 py-7 text-left transition-all duration-500",
                  activeStep === index ? "opacity-100" : "opacity-45 hover:opacity-75",
                )}
              >
                <div className="flex items-start gap-6">
                  <span className="w-10 font-display text-3xl text-primary-foreground/40">{item.number}</span>
                  <div className="flex-1">
                    <h3 className="mb-3 font-display text-2xl transition-transform duration-300 group-hover:translate-x-2 lg:text-3xl">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-primary-foreground/70">{item.body}</p>
                    {activeStep === index && visible ? (
                      <div className="mt-4 h-px overflow-hidden bg-primary-foreground/20">
                        <div key={activeStep} className="progress-line h-full bg-primary-foreground" style={{ "--progress-duration": "5s" } as React.CSSProperties} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="self-start lg:sticky lg:top-32">
            <div className="overflow-hidden border border-primary-foreground/20">
              <div className="flex items-center justify-between border-b border-primary-foreground/20 px-6 py-4">
                <div className="flex gap-2">
                  <span className="size-3 rounded-full bg-primary-foreground/25" />
                  <span className="size-3 rounded-full bg-primary-foreground/25" />
                  <span className="size-3 rounded-full bg-primary-foreground/25" />
                </div>
                <span className="font-mono text-xs text-primary-foreground/60">{step.file}</span>
              </div>
              <div className="min-h-[300px] overflow-x-auto p-6 font-mono text-[13px] lg:p-8 lg:text-sm">
                <pre className="text-primary-foreground/85">
                  {step.code.split("\n").map((line, lineIndex) => (
                    <div key={`${activeStep}-${lineIndex}`} className="ut-code-line leading-loose" style={{ animationDelay: `${lineIndex * 80}ms` }}>
                      <span className="inline-block w-8 select-none text-primary-foreground/30">{lineIndex + 1}</span>
                      <span className="inline-flex">
                        {line.split("").map((char, charIndex) => (
                          <span
                            key={`${activeStep}-${lineIndex}-${charIndex}`}
                            className="ut-code-char"
                            style={{ animationDelay: `${lineIndex * 80 + charIndex * 12}ms` }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-primary-foreground/20 px-6 py-4 font-mono text-xs text-primary-foreground/60">
                <span className="flex items-center gap-3">
                  <span className="size-2 animate-pulse rounded-full bg-primary-foreground" />
                  Step {String(activeStep + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")} · {step.title}
                </span>
                <span>Illustrative · CanopyIQ demo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const provenance = [
  { label: "Verified source", icon: BadgeCheck, body: "Stated on an official programme or organisation page, linked with the date it was checked." },
  { label: "AI assessment", icon: Sparkles, body: "Analysis and drafts produced by Gemma 4 from your profile. Useful guidance, never an official source." },
  { label: "Potential partnership", icon: Building2, body: "An opportunity UpperTune inferred from public business context. The organisation has not requested it." },
  { label: "Illustrative", icon: FileSearch, body: "Demo scenarios and assumptions, such as the fictional CanopyIQ startup, clearly labelled wherever they appear." },
];

export function Provenance() {
  const [ref, visible] = useInView<HTMLElement>(0.1);
  return (
    <section id="evidence" ref={ref} className="relative overflow-hidden bg-foreground/[0.02] py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div className={reveal(visible)}>
            <Eyebrow className="mb-6">Evidence first</Eyebrow>
            <h2 className={`${h2} mb-8`}>
              You always know where
              <br />
              <span className="text-muted-foreground">an answer came from.</span>
            </h2>
            <p className="mb-10 text-xl leading-relaxed text-muted-foreground">
              Deadlines, funding amounts and eligibility rules are only shown when a source supports them. Everything else
              is labelled as needing confirmation.
            </p>
            <div className="flex flex-wrap gap-3">
              {provenance.map((item, index) => (
                <span
                  key={item.label}
                  className={`border border-foreground/10 px-4 py-2 font-mono text-sm ${reveal(visible, "translate-y-4")}`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {provenance.map((item, index) => (
              <div
                key={item.label}
                className={`group border border-foreground/10 bg-background p-6 transition-colors hover:border-foreground/25 ${reveal(visible, "translate-x-8")}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center border border-foreground/10 transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="mb-1 text-lg font-medium transition-transform duration-300 group-hover:translate-x-1">{item.label}</h3>
                    <p className="text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const ecosystem = [
  { country: "Malaysia", code: "MY", orgs: ["Cradle Fund", "MDEC"] },
  { country: "Singapore", code: "SG", orgs: ["Enterprise Singapore", "Startup SG"] },
  { country: "Thailand", code: "TH", orgs: ["NIA Thailand"] },
  { country: "Indonesia", code: "ID", orgs: ["Expansion market in the demo scenario"] },
  { country: "Regional", code: "SEA", orgs: ["Corporate innovation and pilot programmes"] },
];
const marketCount = new Set(
  [...fundingOpportunities, ...corporatePartners].map((item) => item.country).filter((c) => c !== "Southeast Asia"),
).size;

export function Ecosystem() {
  const [ref, visible] = useInView<HTMLElement>(0.1);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setActive((prev) => (prev + 1) % ecosystem.length), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="ecosystem" ref={ref} className="relative scroll-mt-20 overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div className={reveal(visible, "-translate-x-8")}>
            <Eyebrow className="mb-6">ASEAN ecosystem</Eyebrow>
            <h2 className={`${h2} mb-8`}>
              Built around the programmes
              <br />
              <span className="text-muted-foreground">founders in the region actually use.</span>
            </h2>
            <p className="mb-12 text-xl leading-relaxed text-muted-foreground">
              The curated dataset references public information from organisations such as these. Naming them does not
              imply any partnership or endorsement.
            </p>
            <div className="grid grid-cols-3 gap-8">
              {[
                { value: fundingOpportunities.length, label: "Funding programmes" },
                { value: corporatePartners.length, label: "Corporate organisations" },
                { value: marketCount, label: "ASEAN markets" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="mb-2 font-display text-4xl lg:text-5xl">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={`${reveal(visible, "translate-x-8")} delay-200`}>
            <div className="border border-foreground/10 bg-background">
              <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <span className="font-mono text-sm text-muted-foreground">Curated dataset</span>
                <span className="flex items-center gap-2 font-mono text-xs text-primary">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  Public information
                </span>
              </div>
              {ecosystem.map((group, index) => (
                <div
                  key={group.country}
                  className={cn(
                    "flex items-center justify-between gap-6 border-b border-foreground/5 px-6 py-5 transition-colors duration-300 last:border-b-0",
                    active === index && "bg-primary/[0.04]",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn("size-2 rounded-full transition-colors duration-300", active === index ? "bg-primary" : "bg-foreground/20")} />
                    <div>
                      <div className="font-medium">{group.country}</div>
                      <div className="text-sm text-muted-foreground">{group.orgs.join(" · ")}</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">{group.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const [ref, visible] = useInView<HTMLElement>(0.2);
  return (
    <section ref={ref} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className={`relative border border-foreground ${reveal(visible)} duration-1000`}>
          <div className="relative z-10 flex flex-col items-center justify-between gap-12 px-8 py-16 lg:flex-row lg:px-16 lg:py-24">
            <div className="w-full flex-1">
              <Eyebrow className="mb-8">Know your opportunities. Make them happen.</Eyebrow>
              <h2 className="mb-10 font-display text-4xl leading-[0.95] tracking-tight lg:text-7xl">
                Your startup&apos;s intelligence layer for funding, partnerships and growth across ASEAN.
              </h2>
              <UrlForm showCaption={false} className="max-w-2xl" />
              <p className="mt-6 font-mono text-sm text-muted-foreground">
                No API key? The guided demo loads a complete workspace for the illustrative startup CanopyIQ.
              </p>
            </div>
            <div className="-mr-16 hidden h-[460px] w-[460px] shrink-0 items-center justify-center lg:flex">
              <AnimatedTetrahedron />
            </div>
          </div>
          <div className="absolute right-0 top-0 h-32 w-32 border-b border-l border-foreground/10" />
          <div className="absolute bottom-0 left-0 h-32 w-32 border-r border-t border-foreground/10" />
        </div>
      </div>
    </section>
  );
}

const footerLinks = {
  Product: [
    { name: "Product", href: "#product" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Evidence first", href: "#evidence" },
    { name: "ASEAN ecosystem", href: "#ecosystem" },
  ],
  "Get started": [
    { name: "Analyse my startup", href: "#top" },
    { name: "Explore demo", href: "/analyze?demo=1" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="relative border-t border-foreground/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden opacity-20">
        <AnimatedWave />
      </div>
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-12 py-16 md:grid-cols-6 lg:gap-8 lg:py-24">
          <div className="col-span-2 md:col-span-4">
            <Wordmark className="mb-6" />
            <p className="mb-8 max-w-sm leading-relaxed text-muted-foreground">
              Opportunity intelligence for ASEAN startups. Verify all programme details with the official source before
              applying.
            </p>
            <Link href="/analyze?demo=1" className="group inline-flex items-center gap-1 text-sm text-foreground">
              Try the demo
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-6 text-sm font-medium">{title}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.name}
                      <ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-foreground/10 py-8 md:flex-row">
          <p className="text-sm text-muted-foreground">UpperTune · Hackathon prototype · MIT licence</p>
          <span className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" />
            Built with Gemma 4
          </span>
        </div>
      </div>
    </footer>
  );
}

/** @deprecated kept for compatibility; the product section now includes these outcomes. */
export const WhatYouGet = ProductSection;
