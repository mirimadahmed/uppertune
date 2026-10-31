"use client";

import { useEffect, useState } from "react";
import { AnimatedSphere } from "@/components/landing/animated-sphere";
import { Eyebrow } from "@/components/landing/eyebrow";
import { UrlForm } from "@/components/landing/url-form";
import { corporatePartners } from "@/data/corporate-partners";
import { fundingOpportunities } from "@/data/funding-opportunities";

const words = ["grant", "accelerator", "pilot partner", "mentor", "investor"];

const SHORT_TITLES: Record<string, string> = {
  "nia-thailand-innovation-support": "NIA innovation support",
};
const markets = new Set(
  [...fundingOpportunities, ...corporatePartners]
    .map((item) => item.country)
    .filter((c) => c !== "Southeast Asia"),
);
const marqueeItems = [
  {
    value: String(fundingOpportunities.length),
    label: "funding programmes assessed",
    meta: "Curated dataset",
  },
  ...fundingOpportunities.map((item) => ({
    value:
      SHORT_TITLES[item.id] ??
      item.title
        .replace(/\s*\(.*?\)/g, "")
        .split(":")[0]
        .trim(),
    label: item.organisation,
    meta: item.country,
  })),
  {
    value: String(corporatePartners.length),
    label: "corporate organisations mapped",
    meta: "Public sources",
  },
  {
    value: String(markets.size),
    label: "ASEAN markets covered",
    meta: [...markets].join(" · "),
  },
];

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setWordIndex((prev) => (prev + 1) % words.length),
      2500,
    );
    return () => clearInterval(interval);
  }, []);

  const fade = (delay = "") =>
    `transition-all duration-700 ${delay} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`;

  return (
    <>
      <section
        id="top"
        className="relative flex min-h-[100svh] flex-col overflow-hidden"
      >
        <div className="pointer-events-none absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 opacity-40 lg:-right-24 lg:h-[800px] lg:w-[800px]">
          <AnimatedSphere />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-foreground/10"
              style={{ top: `${12.5 * (i + 1)}%` }}
            />
          ))}
          {[...Array(12)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute bottom-0 top-0 w-px bg-foreground/10"
              style={{ left: `${8.33 * (i + 1)}%` }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pb-10 pt-28 lg:px-12">
          <div className={`mb-6 ${fade()}`}>
            <Eyebrow>Startup intelligence for ASEAN</Eyebrow>
          </div>

          <h1
            className={`font-display text-[clamp(2.75rem,6vw,7rem)] leading-[0.92] tracking-tight transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <span className="lg:block">Your next growth </span>
            <span className="lg:block">opportunity is closer </span>
            <span className="lg:block">than you think.</span>
          </h1>

          <p
            className={`mt-5 font-display text-[clamp(1.75rem,3vw,3rem)] leading-tight tracking-tight ${fade("delay-200")}`}
          >
            <span className="sr-only">
              Find your next grant, accelerator, pilot partner, mentor or
              investor.
            </span>
            <span aria-hidden>
              <span className="text-muted-foreground">Find your next </span>
              <span className="relative inline-block text-primary">
                <span key={wordIndex} className="inline-flex">
                  {words[wordIndex].split("").map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block animate-char-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/15" />
              </span>
            </span>
          </p>

          <div className={`mt-10 w-full max-w-[720px] ${fade("delay-300")}`}>
            <UrlForm className="bg-background/70 backdrop-blur-[2px]" />
          </div>
        </div>
      </section>

      <section
        aria-label="In the curated dataset"
        className={`relative overflow-hidden border-y border-foreground/10 bg-background py-10 transition-opacity duration-700 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="mx-auto mb-5 flex max-w-[1400px] items-center gap-4 px-6 lg:px-12">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            In the curated dataset
          </span>
          <span className="h-px flex-1 bg-foreground/10" />
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            Public information · no affiliation implied
          </span>
        </div>
        <div className="flex w-max marquee whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 gap-16 pr-16"
            >
              {marqueeItems.map((item) => (
                <div
                  key={`${copy}-${item.value}-${item.label}`}
                  className="flex items-baseline gap-4"
                >
                  <span className="font-display text-4xl lg:text-5xl">
                    {item.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                    <span className="mt-1 block font-mono text-xs uppercase">
                      {item.meta}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
