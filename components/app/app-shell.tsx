"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider } from "@/components/ui/tooltip"
import { EditProfileProvider } from "@/components/app/edit-profile-dialog"
import { SidebarContent } from "@/components/app/sidebar"
import { TopBar } from "@/components/app/top-bar"
import { useWorkspace } from "@/lib/workspace"

const SIDEBAR_WIDTH = "lg:w-[264px]"
const CONTENT_OFFSET = "lg:pl-[264px]"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { hydrated } = useWorkspace()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!hydrated) return <ShellSkeleton />

  return (
    <TooltipProvider delayDuration={150}>
      <EditProfileProvider>
        <div className="min-h-dvh bg-background">
          <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r bg-sidebar lg:block ${SIDEBAR_WIDTH}`}>
            <SidebarContent />
          </aside>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-[284px] gap-0 bg-sidebar p-0 sm:max-w-[284px]" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className={CONTENT_OFFSET}>
            <TopBar onOpenMenu={() => setMobileOpen(true)} />
            <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-10 lg:pt-10">{children}</main>
          </div>
        </div>
      </EditProfileProvider>
    </TooltipProvider>
  )
}

function ShellSkeleton() {
  return (
    <div className="min-h-dvh bg-background" aria-busy="true" aria-label="Loading workspace">
      <aside className={`fixed inset-y-0 left-0 hidden border-r bg-sidebar p-5 lg:block ${SIDEBAR_WIDTH}`}>
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-8 h-14 w-full rounded-xl" />
        <div className="mt-8 space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </aside>
      <div className={CONTENT_OFFSET}>
        <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6 lg:px-10">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-10">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-10 w-full max-w-md" />
          <Skeleton className="mt-3 h-4 w-full max-w-lg" />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="mt-6 h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
