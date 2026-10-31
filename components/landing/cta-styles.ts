const base =
  "group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60";

/** Template primary CTA: solid pill with an arrow nudge on hover. */
export const primaryCta = `${base} bg-primary text-primary-foreground hover:bg-primary/90`;

/** Template secondary CTA: ink hairline outline pill. */
export const outlineCta = `${base} border border-foreground bg-transparent text-foreground hover:bg-foreground/[0.04]`;

export const ctaSize = {
  lg: "h-14 px-8 text-base",
  md: "h-12 px-6 text-[15px]",
  sm: "h-10 px-5 text-sm",
} as const;
