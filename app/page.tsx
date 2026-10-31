import { Hero } from "@/components/landing/hero";
import { SiteNav } from "@/components/landing/site-nav";
import { Ecosystem, FinalCta, HowItWorks, Provenance, SiteFooter, WhatYouGet } from "@/components/landing/sections";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero />
        <HowItWorks />
        <WhatYouGet />
        <Provenance />
        <Ecosystem />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
