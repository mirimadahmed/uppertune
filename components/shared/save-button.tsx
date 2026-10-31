"use client"

import { Bookmark, BookmarkCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/lib/workspace"
import { cn } from "@/lib/utils"

export function SaveButton({
  id,
  variant = "button",
  className,
}: {
  id: string
  variant?: "icon" | "button"
  className?: string
}) {
  const { isSaved, toggleSaved } = useWorkspace()
  const saved = isSaved(id)
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = toggleSaved(id)
    toast.success(nowSaved ? "Opportunity saved" : "Removed from saved opportunities")
  }
  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save opportunity"}
        title={saved ? "Saved" : "Save opportunity"}
        className={cn(saved ? "text-primary" : "text-muted-foreground", className)}
      >
        {saved ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
      </Button>
    )
  }
  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      size="sm"
      onClick={onClick}
      aria-pressed={saved}
      className={cn(saved && "text-primary", className)}
    >
      {saved ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
      {saved ? "Saved" : "Save"}
    </Button>
  )
}
