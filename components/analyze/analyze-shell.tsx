import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/landing/logo";
import { cn } from "@/lib/utils";

/** Full-height split: paper content column on the left, inverted live panel on the right. */
export function AnalyzeShell({
  children,
  panel,
  panelLabel = "Live profile",
  panelStatus,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
  panelLabel?: string;
  panelStatus?: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
      <section className="relative flex flex-col">
        <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 opacity-70" />
        <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-foreground/10 px-6 sm:px-10 xl:px-16">
          <Wordmark />
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </header>
        <main className="relative z-10 flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:py-[clamp(1.5rem,4vh,3.5rem)] xl:px-16">
          <div className="w-full max-w-[46rem]">{children}</div>
        </main>
      </section>
      <aside className="relative flex min-h-[32rem] flex-col overflow-hidden bg-primary text-primary-foreground lg:min-h-0">
        <div aria-hidden className="diagonal-lines pointer-events-none absolute inset-0 opacity-[0.035]" />
        <div className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-background/10 px-6 sm:px-10">
          <span className="inline-flex items-center gap-3 font-mono text-xs text-background/50">
            <span className="h-px w-8 bg-background/30" />
            {panelLabel}
          </span>
          {panelStatus}
        </div>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{panel}</div>
      </aside>
    </div>
  );
}

export function AnalyzeEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[clamp(1rem,2.6vh,1.75rem)] animate-fade-up">
      <span className="inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
        <span className="h-px w-8 bg-foreground/30" />
        {children}
      </span>
    </div>
  );
}

/** Serif display title with the hero's per-character blur-in; key it by text to replay on change. */
export function AnimatedTitle({ text, highlight }: { text: string; highlight?: string }) {
  let charIndex = 0;
  const words = text.split(" ");
  return (
    <h1
      aria-label={text}
      className="font-display text-[clamp(2.75rem,6.4vh,4.75rem)] leading-[0.98] tracking-tight text-foreground"
    >
      {words.map((word, wi) => (
        <Fragment key={`${wi}-${word}`}>
          <span aria-hidden className="relative inline-block whitespace-nowrap">
            {word.split("").map((char, ci) => {
              const delay = charIndex++ * 26;
              return (
                <span key={ci} className="inline-block animate-char-in" style={{ animationDelay: `${delay}ms` }}>
                  {char}
                </span>
              );
            })}
            {highlight && word === highlight ? (
              <span aria-hidden className="absolute -bottom-1 left-0 right-0 h-[0.16em] bg-primary/20" />
            ) : null}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  );
}

export function PanelStatus({ tone, label, meta }: { tone: "live" | "done" | "idle"; label: string; meta?: string }) {
  return (
    <span className="flex items-center gap-3 font-mono text-xs text-background/50">
      <span className="flex items-center gap-2 text-background/85">
        <span
          className={cn(
            "size-2 rounded-full",
            tone === "live" && "animate-pulse bg-emerald-400",
            tone === "done" && "bg-emerald-400",
            tone === "idle" && "border border-background/50",
          )}
        />
        {label}
      </span>
      {meta ? (
        <>
          <span className="text-background/25">|</span>
          <span>{meta}</span>
        </>
      ) : null}
    </span>
  );
}

export const invertedPrimary =
  "group h-11 rounded-full bg-background px-6 text-primary hover:bg-background/90 hover:text-primary";
export const invertedSecondary =
  "h-11 rounded-full border-background/25 bg-transparent px-6 text-background shadow-none hover:bg-background/10 hover:text-background";
