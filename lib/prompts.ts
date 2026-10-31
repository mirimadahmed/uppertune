import type {
  CorporatePartner,
  ExtractedPage,
  FundingAssessment,
  FundingOpportunity,
  GenerateKind,
  RecommendedPerson,
  StartupProfile,
} from "@/lib/types";

export const REQUIRED_HEADINGS = {
  pitch: (orgName: string) => [
    "Opening",
    "Business problem",
    "Our solution",
    `Value to ${orgName}`,
    "Suggested proof of concept",
    "Proposed next step",
  ],
  poc: () => [
    "Objective",
    "Business problem",
    "Proposed implementation",
    "Scope",
    "Success metrics",
    "Illustrative timeline",
    "Required stakeholders",
    "Next steps",
  ],
  intro: () => ["Message"],
  strategy: () => ["Where your profile is strong", "Strengthen your application", "Close these gaps first"],
} satisfies Record<GenerateKind, (orgName: string) => string[]>;

const clip = (text: string | undefined, max: number) => {
  const value = (text ?? "").replace(/\s+/g, " ").trim();
  return value.length > max ? `${value.slice(0, max)}…` : value;
};

const list = (items: string[] | undefined) => (items && items.length ? items.join("; ") : "(none stated)");

// ---------- AI task 1: startup profile extraction ----------

export function profileExtractionPrompt(input: {
  url?: string;
  page?: ExtractedPage;
  founderDescription?: string;
}): string {
  const { url, page, founderDescription } = input;
  const websiteBlock = page
    ? [
        `URL: ${page.url || url || "(not provided)"}`,
        `Page title: ${clip(page.title, 300) || "(none)"}`,
        `Meta description: ${clip(page.description, 600) || "(none)"}`,
        `Headings: ${page.headings.length ? page.headings.slice(0, 20).map((h) => clip(h, 160)).join(" | ") : "(none)"}`,
        `Visible text (trimmed): ${clip(page.text, 5000) || "(none)"}`,
      ].join("\n")
    : `The website${url ? ` (${url})` : ""} could not be accessed. No website content is available.`;

  return `TASK: Build a structured company profile of a startup for UpperTune, an ASEAN startup opportunity platform.

SOURCE MATERIAL
--- WEBSITE CONTENT ---
${websiteBlock}
--- FOUNDER DESCRIPTION ---
${founderDescription ? clip(founderDescription, 2000) : "(none provided)"}
--- END OF SOURCE MATERIAL ---

RULES
1. Use only facts stated in the source material. Do not use outside knowledge about the company.
2. Never invent company stage, revenue, incorporation country, funding history, investors, employee numbers, customer names, customer counts, partnerships or awards.
3. "stage" and "incorporationCountry": fill only if explicitly stated in the source material; otherwise use null and add "Company stage" / "Country of incorporation" to missingInformation.
4. If you infer something that is not explicitly stated (for example target markets from a country domain, address or currency), you may include it only if reasonably supported, and you must add a matching entry to "assumptions" such as "Target market Malaysia inferred from the .my domain".
5. "missingInformation": short items a funding programme or corporate partner would ask for that the source does not state (for example "Company stage", "Country of incorporation", "Traction or pilot results", "Team size", "Pricing model").
6. Use full English country names (for example "Malaysia", "Singapore", "Indonesia") in targetMarkets and incorporationCountry.
7. "description": one neutral sentence of at most 30 words describing what the company does. No marketing superlatives.
8. "growthPriorities": goals stated or clearly implied by the source; if implied, record the inference in "assumptions".
9. List items are short phrases of 2-8 words. At most 8 items per list. Use [] when nothing is supported.
10. "name": the company or product name exactly as the source states it.

OUTPUT: a single JSON object with exactly these keys:
{
  "name": string,
  "description": string,
  "industry": string[],
  "products": string[],
  "businessModel": string,
  "targetCustomers": string[],
  "targetMarkets": string[],
  "capabilities": string[],
  "technologies": string[],
  "competitiveAdvantages": string[],
  "stage": string | null,
  "incorporationCountry": string | null,
  "growthPriorities": string[],
  "missingInformation": string[],
  "assumptions": string[]
}
If the business model is not stated, use "Not stated" for businessModel and add "Business model" to missingInformation.
Respond with the JSON object only.`;
}

// ---------- Shared context blocks ----------

export function profileContext(profile: StartupProfile): string {
  return [
    `Name: ${profile.name}`,
    profile.website ? `Website: ${profile.website}` : null,
    `Description: ${clip(profile.description, 400)}`,
    `Industry: ${list(profile.industry)}`,
    `Products: ${list(profile.products)}`,
    `Business model: ${profile.businessModel || "Not stated"}`,
    `Target customers: ${list(profile.targetCustomers)}`,
    `Target markets: ${list(profile.targetMarkets)}`,
    `Capabilities: ${list(profile.capabilities)}`,
    `Technologies: ${list(profile.technologies)}`,
    `Competitive advantages: ${list(profile.competitiveAdvantages)}`,
    `Stage: ${profile.stage ?? "Not stated"}`,
    `Country of incorporation: ${profile.incorporationCountry ?? "Not stated"}`,
    `Growth priorities: ${list(profile.growthPriorities)}`,
    `Missing information: ${list(profile.missingInformation)}`,
    `Assumptions (not facts): ${list(profile.assumptions)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function partnerContext(partner: CorporatePartner): string {
  return [
    `Organisation: ${partner.name} (${partner.country})`,
    `Industry: ${partner.industry}`,
    `What it does: ${clip(partner.description, 500)}`,
    `Markets: ${list(partner.markets)}`,
    `Publicly stated priorities: ${list(partner.businessPriorities)}`,
    `Opportunity type: ${
      partner.opportunityType === "published_opportunity"
        ? "PUBLISHED opportunity (a source confirms a published challenge or programme)"
        : "POTENTIAL partnership inferred by UpperTune. The organisation has NOT requested or announced this collaboration."
    }`,
    `Strategic fit (UpperTune analysis): ${clip(partner.strategicFit, 500)}`,
    `Suggested business problem: ${clip(partner.collaboration.problem, 400)}`,
    `Suggested solution: ${clip(partner.collaboration.solution, 400)}`,
    `Suggested pilot scope: ${clip(partner.collaboration.pilotScope, 400)}`,
    `Expected business value: ${clip(partner.collaboration.businessValue, 400)}`,
    `Proposed success metrics: ${list(partner.collaboration.successMetrics)}`,
    `Suggested contact role: ${partner.targetContactRole}`,
    `Suggested approach: ${clip(partner.contactApproach, 300)}`,
    `Documented evidence: ${
      partner.evidence.length
        ? partner.evidence.map((e) => `${clip(e.claim, 200)} [${e.sourceTitle}]`).join("; ")
        : "(none)"
    }`,
  ].join("\n");
}

function personContext(person: RecommendedPerson): string {
  return [
    person.contactType === "verified_person" && person.name
      ? `Person: ${person.name} (name and role verified from a public source)`
      : "Person: no verified individual; this is a SUGGESTED ROLE. Do not invent a name; greet with [Name].",
    `Role: ${person.role}`,
    `Organisation: ${person.organisation} (${person.country})`,
    `Category: ${person.category.replace(/_/g, " ")}`,
    `Expertise: ${list(person.expertise)}`,
    `Why relevant (UpperTune analysis): ${clip(person.relevanceExplanation, 400)}`,
    `Reason to connect: ${clip(person.reasonToConnect, 400)}`,
  ].join("\n");
}

function fundingContext(opp: FundingOpportunity, assessment: FundingAssessment): string {
  const criteria = assessment.criteria
    .map(
      (c) =>
        `- [${c.result === "meets" ? "MEETS" : c.result === "not_met" ? "NOT MET" : "UNKNOWN - needs confirmation"}] ${
          c.criterion.requirement
        }${c.criterion.mandatory ? " (mandatory)" : ""}: ${clip(c.explanation, 220)}`,
    )
    .join("\n");
  return [
    `Programme: ${opp.title}`,
    `Organisation: ${opp.organisation} (${opp.country})`,
    `Category: ${opp.category}`,
    `Summary: ${clip(opp.summary, 300)}`,
    `Description: ${clip(opp.description, 700)}`,
    `Target beneficiaries: ${clip(opp.targetBeneficiaries, 300)}`,
    `Funding structure: ${clip(opp.fundingStructure, 300)}`,
    `Application status: ${opp.applicationStatus.replace(/_/g, " ")}`,
    `Programme focus: ${list(opp.focusKeywords)}`,
    `Deterministic fit score (relevance, not acceptance probability): ${assessment.fitScore}/100`,
    `Deterministic eligibility status: ${assessment.eligibility.replace(/_/g, " ")}`,
    `Criteria assessment:\n${criteria || "- (no criteria recorded)"}`,
    `Unknown mandatory criteria: ${list(assessment.unknowns)}`,
  ].join("\n");
}

// ---------- AI task 4: generation prompts ----------

const COMMON_RULES = `RULES
- Write in British English, in a confident, specific and professional tone. No hype, no emojis.
- Use only the facts in the STARTUP PROFILE and TARGET CONTEXT. Never fabricate traction, revenue, customers, pilots, metrics, awards, funding, team details or partnerships.
- When a useful fact is missing, insert a square-bracket placeholder instead, for example [add a measurable pilot outcome] or [Your name].
- Never claim the organisation has requested, announced or approved anything unless the context says it is a published opportunity.
- Never invent people's names, email addresses, phone numbers or profile links.
- Each section body is 1-4 sentences, or short bullet lines that each start with "- ". Use \\n between bullet lines.
- Be specific to this startup and this organisation; avoid generic statements.`;

const OUTPUT_SHAPE = (headings: string[]) => `OUTPUT: a single JSON object:
{"title": string, "sections": [${headings.map((h) => `{"heading": "${h}", "body": string}`).join(", ")}]}
Use exactly these section headings, in this order. Respond with the JSON object only.`;

export function pitchPrompt(profile: StartupProfile, partner: CorporatePartner): string {
  const headings = REQUIRED_HEADINGS.pitch(partner.name);
  return `TASK: Write a tailored partnership pitch from the founder of ${profile.name} to ${partner.name}, proposing a ${partner.category.replace(/_/g, " ")} collaboration. It will be sent to the ${partner.targetContactRole}.

STARTUP PROFILE
${profileContext(profile)}

TARGET CONTEXT
${partnerContext(partner)}

${COMMON_RULES}
- "Opening" introduces the founder ([Your name]) and the startup and states why ${partner.name} specifically.
- "Suggested proof of concept" proposes a small, measurable pilot and names the success metrics.
- "Proposed next step" asks for a short meeting; no dates unless placeholders.
- Title format: "Partnership proposal: ${profile.name} × ${partner.name}".

${OUTPUT_SHAPE(headings)}`;
}

export function pocPrompt(profile: StartupProfile, partner: CorporatePartner): string {
  const headings = REQUIRED_HEADINGS.poc();
  return `TASK: Write a concise proof-of-concept (POC) outline for a pilot between ${profile.name} and ${partner.name}.

STARTUP PROFILE
${profileContext(profile)}

TARGET CONTEXT
${partnerContext(partner)}

${COMMON_RULES}
- "Success metrics" are bullet lines; include baselines as placeholders such as [agree baseline with ${partner.name}].
- "Illustrative timeline" uses bullet lines by week and must say it is illustrative and not a confirmed delivery estimate.
- "Required stakeholders" lists roles, not invented names.
- Title format: "POC outline: ${profile.name} × ${partner.name}".

${OUTPUT_SHAPE(headings)}`;
}

export function introPrompt(profile: StartupProfile, person: RecommendedPerson): string {
  const headings = REQUIRED_HEADINGS.intro();
  return `TASK: Write a short, polite introduction request from the founder of ${profile.name} to the ${person.role} at ${person.organisation}.

STARTUP PROFILE
${profileContext(profile)}

TARGET CONTEXT
${personContext(person)}

${COMMON_RULES}
- The single "Message" section is the full message body (90-160 words): greeting, who the founder is, why this person specifically, what the founder hopes to learn or discuss, and a polite proposed next step (a short call).
- Use placeholders [Name] (unless a verified name is given), [Your name], [Your role] and [Your email]. Separate paragraphs with \\n\\n.
- Do not claim prior contact, mutual connections or endorsements.
- Title format: "Introduction request: ${person.role}, ${person.organisation}".

${OUTPUT_SHAPE(headings)}`;
}

export function strategyPrompt(
  profile: StartupProfile,
  opp: FundingOpportunity,
  assessment: FundingAssessment,
): string {
  const headings = REQUIRED_HEADINGS.strategy();
  return `TASK: Write tailored application strategy guidance for ${profile.name} applying to "${opp.title}" by ${opp.organisation}.

STARTUP PROFILE
${profileContext(profile)}

TARGET CONTEXT
${fundingContext(opp, assessment)}

${COMMON_RULES}
- The criteria results above were computed deterministically. Do not change them. Treat UNKNOWN criteria as items the founder must confirm, never as met or as strengths.
- "Where your profile is strong": connect specific startup capabilities and products to the programme's stated focus, citing only MEETS criteria and documented overlaps.
- "Strengthen your application": 2-4 bullet lines of specific advice (for example how to explain commercial deployment and measurable outcomes), with placeholders for missing evidence.
- "Close these gaps first": bullet lines for every NOT MET or UNKNOWN mandatory criterion and the most important missing information, phrased as actions ("Confirm…", "Prepare…").
- Do not state funding amounts, deadlines or acceptance chances.
- Title format: "Application strategy: ${opp.title}".

${OUTPUT_SHAPE(headings)}`;
}
