import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function SectionCard({
  index,
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  id,
}: {
  index?: number
  title: string
  description?: React.ReactNode
  icon?: LucideIcon
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={cn("group/section scroll-mt-24 border border-foreground/10 bg-card", className)}>
      <div className="flex flex-col gap-3 border-b border-foreground/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between md:px-7">
        <div className="flex items-start gap-4">
          {index !== undefined ? (
            <span className="mt-1.5 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {String(index).padStart(2, "0")}
            </span>
          ) : Icon ? (
            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center border border-foreground/10 text-foreground">
              <Icon className="size-4" aria-hidden />
            </span>
          ) : null}
          <div>
            <h2 className="font-display text-[1.75rem] leading-tight tracking-tight transition-transform duration-500 group-hover/section:translate-x-1">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="px-5 py-6 md:px-7">{children}</div>
    </section>
  )
}
