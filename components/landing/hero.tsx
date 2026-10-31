import { Eyebrow } from "@/components/landing/eyebrow";
import { ProductPreview } from "@/components/landing/product-preview";
import { UrlForm } from "@/components/landing/url-form";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px)] [background-size:96px_100%] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-16 md:pt-24 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div>
          <Eyebrow>Startup intelligence for ASEAN</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[68px]">
            Your next growth opportunity is closer than you think.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Connect your startup and discover funding programmes, corporate partnerships and the people who can help
            you grow across ASEAN.
          </p>
          <UrlForm className="mt-9 max-w-xl" />
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}
