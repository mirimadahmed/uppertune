import { ArrowUpRight, Quote } from "lucide-react"
import { ProvenanceBadge } from "@/components/shared/badges"
import { hostnameOf } from "@/components/shared/external-link"
import { cn } from "@/lib/utils"
import type { Evidence, SourceType } from "@/lib/types"

const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  official: "Official source",
  public_professional: "Public professional source",
  secondary: "Secondary source",
  demo: "Demo scenario",
}

function formatDate(iso?: string) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function EvidenceList({ evidence, className }: { evidence: Evidence[]; className?: string }) {
  if (evidence.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No sources are attached to this record yet. Treat it as unverified.
      </p>
    )
  }
  return (
    <ul className={cn("space-y-3", className)}>
      {evidence.map((e, i) => {
        const isDemo = e.sourceType === "demo" || e.verificationStatus === "illustrative"
        return (
          <li key={`${e.sourceUrl}-${i}`} className="rounded-xl border bg-background/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{e.claim}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.sourceTitle}
                  {!isDemo ? <> · {hostnameOf(e.sourceUrl)}</> : null}
                </p>
              </div>
              <ProvenanceBadge
                kind={
                  e.verificationStatus === "verified"
                    ? "verified"
                    : e.verificationStatus === "needs_confirmation"
                      ? "needs_confirmation"
                      : "illustrative"
                }
              />
            </div>
            {e.excerpt ? (
              <blockquote className="mt-3 flex gap-2 rounded-lg bg-card px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                <Quote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
                <span>{e.excerpt}</span>
              </blockquote>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="eyebrow !text-[10px]">{SOURCE_TYPE_LABEL[e.sourceType]}</span>
              {e.retrievedAt ? <span>Last verified {formatDate(e.retrievedAt)}</span> : <span>Not yet verified</span>}
              {!isDemo ? (
                <a
                  href={e.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  Visit source <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
