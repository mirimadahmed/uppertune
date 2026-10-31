import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex size-7 items-center justify-center bg-foreground text-background", className)}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 10.5 8 5.5l5 5" strokeLinecap="square" />
        <path d="M3 13h10" strokeLinecap="square" />
      </svg>
    </span>
  );
}

/** Template wordmark: display-type name with a small mono suffix. */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="UpperTune home">
      <span
        className={cn(
          "font-display tracking-tight text-foreground transition-all duration-500",
          compact ? "text-xl" : "text-2xl",
        )}
      >
        UpperTune
      </span>
      <span
        aria-hidden
        className={cn(
          "font-mono uppercase text-muted-foreground transition-all duration-500",
          compact ? "mt-0.5 text-[10px]" : "mt-1 text-xs",
        )}
      >
        ASEAN
      </span>
    </Link>
  );
}
