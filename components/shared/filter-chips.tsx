"use client"

import { cn } from "@/lib/utils"

export type FilterOption<T extends string> = { value: T; label: string; count?: number }

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div role="tablist" className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {o.label}
            {o.count !== undefined ? (
              <span className={cn("font-mono text-[11px] tabular-nums", active ? "text-background/70" : "text-muted-foreground/80")}>
                {o.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
