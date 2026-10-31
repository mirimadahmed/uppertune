import { Hero } from "@/components/landing/hero";
import { SiteNav } from "@/components/landing/site-nav";
import { Ecosystem, FinalCta, HowItWorks, ProductSection, Provenance, SiteFooter } from "@/components/landing/sections";

export default function Home() {
  return (
    <div className="noise-overlay relative min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero />
        <ProductSection />
        <HowItWorks />
        <Provenance />
        <Ecosystem />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
