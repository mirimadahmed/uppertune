// Shared domain contract for UpperTune. Every module codes against these types.

export type SourceType = "official" | "public_professional" | "secondary" | "demo";
export type VerificationStatus = "verified" | "needs_confirmation" | "illustrative";

export type Evidence = {
  claim: string;
  sourceTitle: string;
  sourceUrl: string;
  excerpt?: string;
  sourceType: SourceType;
  /** ISO date (YYYY-MM-DD) the source was last checked. Only set when actually checked. */
  retrievedAt?: string;
  verificationStatus: VerificationStatus;
};

export type StartupProfile = {
  name: string;
  website?: string;
  description: string;
  industry: string[];
  products: string[];
  businessModel: string;
  targetCustomers: string[];
  targetMarkets: string[];
  capabilities: string[];
  technologies: string[];
  competitiveAdvantages: string[];
  stage?: string;
  incorporationCountry?: string;
  growthPriorities: string[];
  missingInformation: string[];
  assumptions: string[];
};

/** Where the current profile came from. */
export type ProfileSource = "demo" | "gemma" | "founder";

// ---------- Funding ----------

export type CriterionCheck =
  | { type: "incorporation"; countries: string[] }
  | { type: "market"; countries: string[] }
  /** Matches keywords against the profile's industry/products/capabilities/technologies/description. */
  | { type: "keywords"; keywords: string[]; label: string }
  | { type: "stage"; stages: string[] }
  /** Cannot be checked from a profile; always needs founder confirmation. */
  | { type: "manual" };

export type EligibilityCriterion = {
  id: string;
  requirement: string;
  mandatory: boolean;
  check: CriterionCheck;
  /** official = stated by the programme source; suggested = UpperTune interpretation. */
  basis: "official" | "suggested";
};

export type FundingCategory = "grant" | "investment" | "accelerator" | "government" | "challenge";
export type ApplicationStatus = "open" | "upcoming" | "closed" | "not_confirmed";

export type PreparationCategory =
  | "company"
  | "financial"
  | "business_plan"
  | "product"
  | "technical"
  | "commercialisation";

export type PreparationItem = {
  item: string;
  category: PreparationCategory;
  /** true only when an official source states it as a requirement. */
  confirmed: boolean;
};

export type RoadmapStepTemplate = {
  task: string;
  why: string;
  requiredInfo: string;
  effort?: string;
};

export type FundingOpportunity = {
  id: string;
  title: string;
  organisation: string;
  country: string;
  category: FundingCategory;
  /** One-line summary for cards. */
  summary: string;
  description: string;
  targetBeneficiaries: string;
  /** Descriptive; must be sourced or say it is not confirmed. */
  fundingStructure: string;
  /** Only when supported by a fetched official source. */
  fundingAmount?: string;
  applicationStatus: ApplicationStatus;
  /** Only when supported by a fetched official source. */
  deadline?: string;
  officialUrl: string;
  /** Themes the programme cares about; used for relevance scoring. */
  focusKeywords: string[];
  eligibilityCriteria: EligibilityCriterion[];
  preparation: PreparationItem[];
  roadmap: RoadmapStepTemplate[];
  evidence: Evidence[];
  demoOnly?: boolean;
};

// ---------- Partnerships ----------

export type PartnershipCategory =
  | "commercial_pilot"
  | "technology_integration"
  | "distribution"
  | "supplier"
  | "joint_development"
  | "corporate_innovation"
  | "market_expansion";

export type CorporatePartner = {
  id: string;
  name: string;
  /** 2-3 letter professional monogram used instead of a logo. */
  monogram: string;
  country: string;
  industry: string;
  website: string;
  description: string;
  markets: string[];
  /** Publicly stated priorities, each backed by an evidence item. */
  businessPriorities: string[];
  category: PartnershipCategory;
  /** published_opportunity only when a source confirms a published challenge/RFP/programme. */
  opportunityType: "published_opportunity" | "potential_partnership";
  focusKeywords: string[];
  /** Specific strategic connection; must not claim the organisation requested anything. */
  strategicFit: string;
  collaboration: {
    problem: string;
    solution: string;
    pilotScope: string;
    businessValue: string;
    successMetrics: string[];
  };
  targetContactRole: string;
  contactApproach: string;
  evidence: Evidence[];
  demoOnly?: boolean;
};

// ---------- People ----------

export type PersonCategory =
  | "mentor"
  | "investor"
  | "corporate_contact"
  | "programme_representative"
  | "ecosystem_connector";

export type RecommendedPerson = {
  id: string;
  /** Only when a public official/professional source verifies the name and role. */
  name?: string;
  role: string;
  organisation: string;
  country: string;
  category: PersonCategory;
  expertise: string[];
  relevanceExplanation: string;
  reasonToConnect: string;
  /** Official organisation page or verified public profile. Never invented. */
  publicProfileUrl?: string;
  contactType: "verified_person" | "suggested_role";
  relatedOpportunityId?: string;
  focusKeywords: string[];
  evidence: Evidence[];
};

// ---------- Action plan ----------

export type TaskStatus = "not_started" | "in_progress" | "completed";
export type TaskGroup = "funding" | "partnerships" | "network";
export type TaskPriority = "high" | "medium" | "low";

export type RoadmapTask = {
  id: string;
  group: TaskGroup;
  title: string;
  relatedOpportunityId?: string;
  relatedType?: "funding" | "partner" | "person";
  reason: string;
  nextStep: string;
  priority: TaskPriority;
  defaultStatus: TaskStatus;
  /** Only when sourced or explicitly proposed (then deadlineNote must say "Proposed"). */
  deadline?: string;
  deadlineNote?: string;
  sourceUrl?: string;
  checklist?: string[];
};

// ---------- Assessments (computed by lib/matching.ts) ----------

export type CriterionResult = "meets" | "not_met" | "unknown";

export type CriterionAssessment = {
  criterion: EligibilityCriterion;
  result: CriterionResult;
  explanation: string;
  /** What in the profile supports the result, or what is missing. */
  evidence: string;
};

export type EligibilityStatus =
  | "eligible"
  | "potentially_eligible"
  | "not_eligible"
  | "needs_verification";

export type FitFactor = { label: string; score: number; max: number; detail: string };

export type FundingAssessment = {
  opportunity: FundingOpportunity;
  /** 0-100 relevance measure. NOT an acceptance probability. */
  fitScore: number;
  factors: FitFactor[];
  criteria: CriterionAssessment[];
  eligibility: EligibilityStatus;
  /** Short, specific reasons this is relevant. */
  reasons: string[];
  nextStep: string;
  /** Human-readable list of mandatory criteria still unknown. */
  unknowns: string[];
};

export type PartnerAssessment = {
  partner: CorporatePartner;
  fitScore: number;
  factors: FitFactor[];
  reasons: string[];
  nextStep: string;
};

export type PersonAssessment = {
  person: RecommendedPerson;
  relevance: number;
  reasons: string[];
};

// ---------- AI generation ----------

export type GenerateKind = "pitch" | "poc" | "intro" | "strategy";

export type GeneratedSection = { heading: string; body: string };

export type GeneratedDocument = {
  kind: GenerateKind;
  targetId: string;
  title: string;
  sections: GeneratedSection[];
  /** gemma = live model output; template = deterministic demo intelligence fallback. */
  source: "gemma" | "template";
  model?: string;
  generatedAt: string;
  note?: string;
};

export type GenerateRequest = {
  kind: GenerateKind;
  /** id of a FundingOpportunity (strategy), CorporatePartner (pitch/poc) or RecommendedPerson (intro). */
  targetId: string;
  profile: StartupProfile;
};

export type GenerateResponse = { document: GeneratedDocument };

// ---------- Website extraction + analysis API ----------

export type ExtractedPage = {
  url: string;
  title: string;
  description: string;
  headings: string[];
  text: string;
};

export type ExtractResponse =
  | { ok: true; page: ExtractedPage }
  | { ok: false; reason: string };

export type AnalyzeRequest = {
  url?: string;
  page?: ExtractedPage;
  founderDescription?: string;
};

export type AnalyzeResponse =
  | { ok: true; profile: StartupProfile; source: "gemma"; model: string }
  | { ok: false; code: "no_api_key" | "model_error" | "invalid_input"; message: string };

// ---------- Persisted workspace ----------

export type WorkspaceState = {
  version: 1;
  mode: "demo" | "live";
  profile: StartupProfile;
  profileSource: ProfileSource;
  analysedAt: string;
  analysedUrl?: string;
  analysisNotes?: string[];
  savedIds: string[];
  taskStatus: Record<string, TaskStatus>;
  /** key: `${kind}:${targetId}` */
  documents: Record<string, GeneratedDocument>;
  /** key: `${kind}:${targetId}` -> user-edited plain text */
  edits: Record<string, string>;
};
