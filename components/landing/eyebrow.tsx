import { cn } from "@/lib/utils";

/** Template eyebrow: mono label with a leading hairline. */
export function Eyebrow({
  children,
  className,
  inverted = false,
}: {
  children: React.ReactNode;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 font-mono text-sm",
        inverted ? "text-background/50" : "text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden className={cn("h-px w-8", inverted ? "bg-background/30" : "bg-foreground/30")} />
      {children}
    </span>
  );
}
