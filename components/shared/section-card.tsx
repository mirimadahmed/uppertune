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
    <section id={id} className={cn("scroll-mt-24 rounded-2xl border bg-card card-shadow", className)}>
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-start gap-3">
          {index !== undefined ? (
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-medium text-muted-foreground">
              {String(index).padStart(2, "0")}
            </span>
          ) : Icon ? (
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-4" aria-hidden />
            </span>
          ) : null}
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="px-5 py-5 md:px-6">{children}</div>
    </section>
  )
}
