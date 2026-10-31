import { OpportunityTypeBadge } from "@/components/shared/badges"

/** Explains the critical distinction between published and inferred partnership opportunities. */
export function OpportunityTypeLegend() {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border bg-border card-shadow md:grid-cols-2">
      <div className="flex flex-col gap-2 bg-card px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
        <OpportunityTypeBadge type="published_opportunity" className="self-start" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          The organisation has <span className="font-medium text-foreground">explicitly published</span> a challenge,
          RFP or programme that matches your startup.
        </p>
      </div>
      <div className="flex flex-col gap-2 bg-card px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
        <OpportunityTypeBadge type="potential_partnership" className="self-start" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          UpperTune has <span className="font-medium text-foreground">inferred a strategic fit</span>. The organisation
          has not necessarily invited applications or expressed buying intent.
        </p>
      </div>
    </div>
  )
}
