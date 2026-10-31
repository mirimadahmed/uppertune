import { cn } from "@/lib/utils"

/** Template-style eyebrow: mono label with a leading hairline. */
export function Eyebrow({
  children,
  className,
  inverted = false,
}: {
  children: React.ReactNode
  className?: string
  inverted?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 font-mono text-sm",
        inverted ? "text-background/50" : "text-muted-foreground",
        className,
      )}
    >
      <span className={cn("h-px w-8 shrink-0", inverted ? "bg-background/30" : "bg-foreground/30")} aria-hidden />
      {children}
    </span>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
        <h1 className="font-display text-5xl leading-[1.02] tracking-tight lg:text-[4rem]">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
