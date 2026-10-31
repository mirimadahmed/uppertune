import type { ApplicationStatus, EligibilityStatus, FundingCategory, PreparationCategory } from "@/lib/types"

export const ELIGIBILITY_LABEL: Record<EligibilityStatus, string> = {
  eligible: "Eligible",
  potentially_eligible: "Potentially eligible",
  needs_verification: "Needs verification",
  not_eligible: "Not eligible",
}

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  open: "Open",
  upcoming: "Upcoming",
  closed: "Closed",
  not_confirmed: "Intake not confirmed",
}

export const CATEGORY_CHIP_LABEL: Record<FundingCategory, string> = {
  grant: "Grants",
  investment: "Investment",
  government: "Government programmes",
  accelerator: "Accelerators",
  challenge: "Innovation challenges",
}

export const CATEGORY_ORDER: FundingCategory[] = ["grant", "investment", "government", "accelerator", "challenge"]

export const PREPARATION_LABEL: Record<PreparationCategory, string> = {
  company: "Company documents",
  financial: "Financial information",
  business_plan: "Business plan",
  product: "Product information",
  technical: "Technical documents",
  commercialisation: "Commercialisation plans",
}

export const PREPARATION_ORDER: PreparationCategory[] = [
  "company",
  "financial",
  "business_plan",
  "product",
  "technical",
  "commercialisation",
]

export function roadmapStepKey(opportunityId: string, index: number) {
  return `step:${opportunityId}:${index}`
}
