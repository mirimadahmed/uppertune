"use client"

import Link from "next/link"
import { FlaskConical, PencilLine, RotateCcw, Search, UserRound } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEditProfile } from "@/components/app/edit-profile-dialog"
import { workspaceModeLabel } from "@/components/app/workspace-meta"
import { useWorkspace } from "@/lib/workspace"

export function WorkspaceMenu({
  trigger,
  align = "end",
  side = "bottom",
  onAction,
}: {
  trigger: React.ReactNode
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
  onAction?: () => void
}) {
  const { state, loadDemo, reset } = useWorkspace()
  const { openEditProfile } = useEditProfile()
  const mode = workspaceModeLabel(state)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-64">
        <DropdownMenuLabel className="py-2">
          <span className="block truncate text-sm font-semibold">{state.profile.name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {mode.title} · {mode.detail}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            onAction?.()
            openEditProfile()
          }}
        >
          <PencilLine />
          Edit profile
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/profile" onClick={onAction}>
            <UserRound />
            View startup profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            onAction?.()
            loadDemo()
            toast.success("CanopyIQ demo loaded", { description: "Curated sample opportunities are ready to explore." })
          }}
        >
          <FlaskConical />
          Load CanopyIQ demo
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/" onClick={onAction}>
            <Search />
            Analyse another startup
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            onAction?.()
            reset()
            toast.success("Workspace reset", {
              description: "Saved items, task progress and generated documents were cleared.",
            })
          }}
        >
          <RotateCcw />
          Reset workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
