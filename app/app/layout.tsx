import type { Metadata } from "next"
import { AppShell } from "@/components/app/app-shell"

export const metadata: Metadata = {
  title: "Workspace · UpperTune",
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
