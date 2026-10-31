import { cn } from "@/lib/utils"

const SIZE = {
  sm: "size-8 text-[11px] rounded-lg",
  md: "size-10 text-xs rounded-xl",
  lg: "size-14 text-sm rounded-2xl",
} as const

const TONE = {
  ink: "bg-foreground text-background",
  primary: "bg-primary text-primary-foreground",
  teal: "bg-accent-teal text-white",
} as const

export function Monogram({
  text,
  size = "md",
  tone = "ink",
  className,
}: {
  text: string
  size?: keyof typeof SIZE
  tone?: keyof typeof TONE
  className?: string
}) {
  const label = text.trim().slice(0, 3).toUpperCase()
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center font-mono font-semibold tracking-wider",
        SIZE[size],
        TONE[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}

export function initialsOf(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
