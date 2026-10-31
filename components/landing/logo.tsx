import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg bg-foreground text-background",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 10.5 8 5.5l5 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 13h10" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="UpperTune home">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">UpperTune</span>
    </Link>
  );
}
