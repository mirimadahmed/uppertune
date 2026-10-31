import type { LucideIcon } from "lucide-react"
import { SearchX } from "lucide-react"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-dashed border-foreground/20 bg-card/60 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-5 inline-flex size-11 items-center justify-center border border-foreground/15 text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="font-display text-2xl tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
