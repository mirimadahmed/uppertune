// Deterministic, transparent matching engine. Pure functions: safe on server and client.
import type {
  CorporatePartner,
  CriterionAssessment,
  CriterionResult,
  EligibilityCriterion,
  EligibilityStatus,
  FitFactor,
  FundingAssessment,
  FundingOpportunity,
  PartnerAssessment,
  PersonAssessment,
  RecommendedPerson,
  RoadmapTask,
  StartupProfile,
  TaskPriority,
} from "@/lib/types";
import { fundingOpportunities } from "@/data/funding-opportunities";
import { corporatePartners } from "@/data/corporate-partners";
import { recommendedPeople } from "@/data/people";
import { demoTasks } from "@/data/action-plan";

export const RELEVANCE_THRESHOLD = 40;

export const FIT_SCORE_EXPLANATION =
  "Fit score indicates how closely your startup matches the available programme criteria. It does not represent an acceptance probability.";

// ---------- Text helpers ----------

const ASEAN_COUNTRIES = [
  "brunei",
  "cambodia",
  "indonesia",
  "laos",
  "lao pdr",
  "malaysia",
  "myanmar",
  "philippines",
  "singapore",
  "thailand",
  "vietnam",
  "viet nam",
  "timor-leste",
];

const REGIONAL_TERMS = ["asean", "southeast asia", "south-east asia", "south east asia"];

const SUFFIXES = ["ation", "ural", "ture", "ing", "ics", "ies", "al", "es", "s", "y"];

const CUSTOMER_STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "of",
  "companies",
  "company",
  "teams",
  "team",
  "businesses",
  "business",
  "organisations",
  "organizations",
  "firms",
  "enterprises",
  "operators",
]);

function norm(s: string): string {
  return s.toLowerCase().trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stem(word: string): string {
  const w = norm(word);
  if (w.length <= 5) return w;
  for (const suffix of SUFFIXES) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 4) return w.slice(0, -suffix.length);
  }
  return w;
}

function hasWord(text: string, word: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(word)}([^a-z0-9]|$)`).test(text);
}

/** Stemming-lite keyword match: short terms match whole words, longer terms match on stems. */
function matchesKeyword(text: string, keyword: string): boolean {
  const k = norm(keyword);
  if (!k) return false;
  if (k.length <= 3) return hasWord(text, k);
  if (text.includes(k)) return true;
  const words = k.split(/[\s\-/]+/).filter(Boolean);
  if (words.length === 0) return false;
  return words.every((w) => (w.length <= 3 ? hasWord(text, w) : text.includes(stem(w))));
}

function keywordHits(text: string, keywords: string[]): string[] {
  const seen = new Set<string>();
  const hits: string[] = [];
  for (const kw of keywords) {
    const k = norm(kw);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    if (matchesKeyword(text, k)) hits.push(kw);
  }
  return hits;
}

const DISPLAY_TERMS: Record<string, string> = {
  ai: "AI",
  iot: "IoT",
  gis: "GIS",
  "ai models": "AI models",
  "research-driven ip": "research-driven IP",
  "smart sme": "Smart SME",
};

function pretty(term: string): string {
  return DISPLAY_TERMS[norm(term)] ?? term;
}

function listText(items: string[], max = 3): string {
  const shown = items.slice(0, max).map(pretty);
  if (shown.length === 0) return "";
  if (shown.length === 1) return shown[0];
  return `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function isRegional(place: string): boolean {
  const p = norm(place);
  return p === "sea" || REGIONAL_TERMS.some((r) => p.includes(r));
}

function isAsean(place: string): boolean {
  return ASEAN_COUNTRIES.includes(norm(place));
}

function samePlace(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  return x === y || x.includes(y) || y.includes(x);
}

export function profileText(p: StartupProfile): string {
  return [
    p.description,
    ...p.industry,
    ...p.products,
    ...p.capabilities,
    ...p.technologies,
    ...p.targetCustomers,
    p.businessModel,
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();
}

/** Profile text plus growth priorities: used for focus alignment, not for eligibility checks. */
function focusText(p: StartupProfile): string {
  return `${profileText(p)} | ${p.growthPriorities.join(" | ").toLowerCase()}`;
}

function capabilityText(p: StartupProfile): string {
  return [...p.capabilities, ...p.technologies, ...p.products].join(" | ").toLowerCase();
}

// ---------- Shared factors ----------

function focusFactor(p: StartupProfile, keywords: string[], subject: string): { factor: FitFactor; matched: string[] } {
  const matched = keywordHits(focusText(p), keywords);
  const target = Math.max(1, Math.min(5, keywords.length));
  const score = Math.round(40 * Math.min(1, matched.length / target));
  const detail =
    matched.length > 0
      ? `Matched ${matched.length} of ${keywords.length} ${subject} themes: ${listText(matched, 5)}.`
      : `No overlap found between your profile and the ${subject} themes (${listText(keywords, 3)}).`;
  return { factor: { label: "Industry & focus alignment", score, max: 40, detail }, matched };
}

type GeoResult = { factor: FitFactor; matched: string[]; kind: "primary" | "secondary" | "regional" | "none" | "unknown" };

function geographyFactor(p: StartupProfile, targets: string[]): GeoResult {
  const markets = p.targetMarkets.filter(Boolean);
  const label = "Geography";
  if (markets.length === 0) {
    return {
      factor: { label, score: 8, max: 25, detail: "No target markets stated in your profile, so geography could not be assessed." },
      matched: [],
      kind: "unknown",
    };
  }
  const matched = markets.filter((m) => targets.some((t) => samePlace(m, t)));
  const primaryHit = targets.some((t) => samePlace(markets[0], t));
  const regional = targets.some(isRegional) && markets.some((m) => isAsean(m) || isRegional(m));
  let score = 0;
  let kind: GeoResult["kind"] = "none";
  let detail = `Focused on ${listText(targets, 4)}, outside your stated markets (${listText(markets, 4)}).`;
  if (primaryHit) {
    score = targets.length === 1 ? 25 : Math.min(25, 19 + 3 * matched.length);
    kind = "primary";
    detail = `Covers ${listText(matched, 4)}, including your primary market (${markets[0]}).`;
  } else if (matched.length > 0) {
    score = Math.min(20, 12 + 3 * matched.length);
    kind = "secondary";
    detail = `Covers ${listText(matched, 4)}, part of your expansion markets.`;
  }
  if (regional && score < 20) {
    score = 20;
    kind = "regional";
    detail = `Regional scope (${listText(targets.filter(isRegional), 2)}) includes your markets: ${listText(markets, 4)}.`;
  }
  return { factor: { label, score, max: 25, detail }, matched: kind === "regional" ? markets : matched, kind };
}

function capabilityFactor(p: StartupProfile, keywords: string[]): { factor: FitFactor; matched: string[] } {
  const matched = keywordHits(capabilityText(p), keywords);
  const score = Math.min(20, 5 * matched.length);
  const detail =
    matched.length > 0
      ? `Your capabilities and technologies match: ${listText(matched, 4)}.`
      : "No direct match between your capabilities or technologies and this focus.";
  return { factor: { label: "Capability & technology match", score, max: 20, detail }, matched };
}

// ---------- Stage helpers ----------

type StageGroup = "early" | "growth" | "late";

function stageGroup(stage: string): StageGroup | undefined {
  const s = norm(stage);
  if (/series\s*[c-z]\b|late|pre-?ipo|mature/.test(s)) return "late";
  if (/series\s*[ab]\b|growth|scale/.test(s)) return "growth";
  if (/pre-?seed|seed|early|idea|ideation|prototype|mvp/.test(s)) return "early";
  return undefined;
}

function stageMatch(profileStage: string, stages: string[]): CriterionResult {
  const ps = norm(profileStage);
  if (stages.some((s) => samePlace(ps, s))) return "meets";
  const pg = stageGroup(ps);
  const groups = stages.map(stageGroup).filter((g): g is StageGroup => Boolean(g));
  if (!pg || groups.length === 0) return "unknown";
  return groups.includes(pg) ? "meets" : "not_met";
}

// ---------- Eligibility ----------

function assessCriterion(p: StartupProfile, c: EligibilityCriterion): CriterionAssessment {
  const check = c.check;
  switch (check.type) {
    case "incorporation": {
      const required = listText(check.countries, 4);
      if (!p.incorporationCountry?.trim()) {
        return {
          criterion: c,
          result: "unknown",
          explanation: "Incorporation country not stated in your profile",
          evidence: `Missing: country of incorporation (required: ${required})`,
        };
      }
      const ok = check.countries.some((ct) => samePlace(p.incorporationCountry as string, ct));
      return {
        criterion: c,
        result: ok ? "meets" : "not_met",
        explanation: ok
          ? `Incorporated in ${p.incorporationCountry}`
          : `Incorporated in ${p.incorporationCountry}; this requires ${required}`,
        evidence: `Profile: incorporation country = ${p.incorporationCountry}`,
      };
    }
    case "market": {
      const markets = p.targetMarkets.filter(Boolean);
      const required = listText(check.countries, 4);
      if (markets.length === 0) {
        return {
          criterion: c,
          result: "unknown",
          explanation: "No target markets stated in your profile",
          evidence: `Missing: target markets (required: ${required})`,
        };
      }
      const direct = markets.filter((m) => check.countries.some((ct) => samePlace(m, ct)));
      const regionalOk = check.countries.some(isRegional) && markets.some((m) => isAsean(m) || isRegional(m));
      if (direct.length > 0 || regionalOk) {
        const shown = direct.length > 0 ? direct : markets;
        return {
          criterion: c,
          result: "meets",
          explanation: `You target ${listText(shown, 4)}${regionalOk && direct.length === 0 ? ` (within ${required})` : ""}`,
          evidence: `Profile target markets: ${markets.join(", ")}`,
        };
      }
      return {
        criterion: c,
        result: "not_met",
        explanation: `Your stated markets (${listText(markets, 4)}) do not include ${required}`,
        evidence: `Profile target markets: ${markets.join(", ")}`,
      };
    }
    case "keywords": {
      const matched = keywordHits(profileText(p), check.keywords);
      if (matched.length > 0) {
        return {
          criterion: c,
          result: "meets",
          explanation: `Your profile shows ${check.label.toLowerCase()}: ${listText(matched, 3)}`,
          evidence: `Matched terms: ${matched.join(", ")}`,
        };
      }
      return {
        criterion: c,
        result: c.mandatory ? "unknown" : "not_met",
        explanation: `No evidence of ${check.label.toLowerCase()} found in your profile`,
        evidence: `Looked for: ${listText(check.keywords, 5)}`,
      };
    }
    case "stage": {
      const required = listText(check.stages, 4);
      if (!p.stage?.trim()) {
        return {
          criterion: c,
          result: "unknown",
          explanation: "Stage not stated in your profile",
          evidence: `Missing: company stage (required: ${required})`,
        };
      }
      const result = stageMatch(p.stage, check.stages);
      const explanation =
        result === "meets"
          ? `Your stage (${p.stage}) fits ${required}`
          : result === "not_met"
            ? `Your stage (${p.stage}) is outside ${required}`
            : `Your stage (${p.stage}) could not be matched to ${required}`;
      return { criterion: c, result, explanation, evidence: `Profile stage: ${p.stage}` };
    }
    case "manual":
    default:
      return {
        criterion: c,
        result: "unknown",
        explanation: "Cannot be verified from your profile — needs founder confirmation",
        evidence: "Founder confirmation needed",
      };
  }
}

function eligibilityStatus(criteria: CriterionAssessment[], fitScore: number): EligibilityStatus {
  const mandatory = criteria.filter((c) => c.criterion.mandatory);
  if (mandatory.length === 0) return "needs_verification";
  if (mandatory.some((c) => c.result === "not_met")) return "not_eligible";
  if (fitScore < 20) return "needs_verification";
  if (mandatory.some((c) => c.result === "unknown")) return "potentially_eligible";
  return "eligible";
}

function stageFactor(p: StartupProfile, criteria: CriterionAssessment[]): FitFactor {
  const label = "Stage fit";
  const stageCriterion = criteria.find((c) => c.criterion.check.type === "stage");
  if (!stageCriterion) {
    return { label, score: 10, max: 15, detail: "No stage requirement recorded for this programme — neutral score." };
  }
  if (stageCriterion.result === "meets") return { label, score: 15, max: 15, detail: stageCriterion.explanation + "." };
  if (stageCriterion.result === "not_met") return { label, score: 3, max: 15, detail: stageCriterion.explanation + "." };
  return {
    label,
    score: 7,
    max: 15,
    detail: p.stage ? `${stageCriterion.explanation}.` : "Stage not stated in your profile — partial score.",
  };
}

// ---------- Funding ----------

const FUNDING_PRIORITY_PATTERNS: Record<FundingOpportunity["category"], RegExp> = {
  grant: /fund|grant|capital|commerciali[sz]/,
  investment: /fund|invest|capital|raise/,
  government: /fund|grant|capital|commerciali[sz]/,
  accelerator: /scale|mentor|accelerat|technical/,
  challenge: /pilot|partner|customer|commerciali[sz]/,
};

export function assessFunding(profile: StartupProfile, opp: FundingOpportunity): FundingAssessment {
  const criteria = opp.eligibilityCriteria.map((c) => assessCriterion(profile, c));
  const criteriaKeywords = opp.eligibilityCriteria.flatMap((c) => (c.check.type === "keywords" ? c.check.keywords : []));

  const focus = focusFactor(profile, opp.focusKeywords, "programme");
  const geo = geographyFactor(profile, [opp.country]);
  const stage = stageFactor(profile, criteria);
  const cap = capabilityFactor(profile, [...opp.focusKeywords, ...criteriaKeywords]);
  const factors = [focus.factor, geo.factor, stage, cap.factor];
  const fitScore = clampScore(factors.reduce((sum, f) => sum + f.score, 0));

  const eligibility = eligibilityStatus(criteria, fitScore);
  const unknownMandatory = criteria.filter((c) => c.criterion.mandatory && c.result === "unknown");
  const unknowns = unknownMandatory.map((c) => c.criterion.requirement);
  const notMet = criteria.find((c) => c.criterion.mandatory && c.result === "not_met");

  const reasons: string[] = [];
  if (focus.matched.length > 0) {
    reasons.push(`Your focus on ${listText(focus.matched, 3)} aligns with the programme's themes.`);
  }
  const priority = profile.growthPriorities.find((gp) => FUNDING_PRIORITY_PATTERNS[opp.category].test(gp.toLowerCase()));
  if (priority && eligibility !== "not_eligible") reasons.push(`Supports your growth priority: "${priority}".`);
  if (geo.kind === "primary") reasons.push(`Available in ${opp.country}, your primary market.`);
  else if (geo.kind === "secondary") reasons.push(`Available in ${opp.country}, one of your expansion markets.`);
  else if (geo.kind === "regional") reasons.push(`Covers ${opp.country}, where you target ${listText(profile.targetMarkets, 4)}.`);
  else if (geo.kind === "none") reasons.push(`Focused on ${opp.country}, outside your stated markets (${listText(profile.targetMarkets, 4)}).`);
  if (eligibility === "eligible") reasons.push("Your profile meets every published mandatory criterion.");
  else if (eligibility === "not_eligible" && notMet) reasons.push(`Conflicts with a mandatory requirement: ${notMet.criterion.requirement}.`);
  else if (unknowns.length > 0) reasons.push(`${unknowns.length} mandatory requirement${unknowns.length === 1 ? "" : "s"} still need${unknowns.length === 1 ? "s" : ""} confirmation.`);
  if (reasons.length < 2 && cap.matched.length > 0) {
    reasons.push(`Your capabilities in ${listText(cap.matched, 3)} are relevant to this programme.`);
  }

  const nextStep =
    eligibility === "not_eligible" && notMet
      ? `Review requirement: ${notMet.criterion.requirement}`
      : unknowns.length > 0
        ? `Confirm: ${unknowns[0]}`
        : (opp.roadmap[0]?.task ?? "Review the official programme page");

  return {
    opportunity: opp,
    fitScore,
    factors,
    criteria,
    eligibility,
    reasons: reasons.slice(0, 4),
    nextStep,
    unknowns,
  };
}

const ELIGIBILITY_RANK: Record<EligibilityStatus, number> = {
  eligible: 0,
  potentially_eligible: 1,
  needs_verification: 2,
  not_eligible: 3,
};

export function rankFunding(profile: StartupProfile, opps: FundingOpportunity[] = fundingOpportunities): FundingAssessment[] {
  return opps
    .map((o) => assessFunding(profile, o))
    .sort(
      (a, b) =>
        b.fitScore - a.fitScore ||
        ELIGIBILITY_RANK[a.eligibility] - ELIGIBILITY_RANK[b.eligibility] ||
        a.opportunity.title.localeCompare(b.opportunity.title),
    );
}

// ---------- Partners ----------

const PARTNER_CATEGORY_LABEL: Record<CorporatePartner["category"], string> = {
  commercial_pilot: "commercial pilot",
  technology_integration: "technology integration",
  distribution: "distribution partnership",
  supplier: "supplier relationship",
  joint_development: "joint product development",
  corporate_innovation: "corporate innovation collaboration",
  market_expansion: "market expansion partnership",
};

function customerTerms(p: StartupProfile): { term: string; source: string }[] {
  const terms: { term: string; source: string }[] = [];
  for (const customer of p.targetCustomers) {
    const words = norm(customer)
      .split(/[\s,/()]+/)
      .filter((w) => w.length >= 4 && !CUSTOMER_STOPWORDS.has(w));
    for (const w of words) terms.push({ term: w, source: customer });
  }
  return terms;
}

function customerFactor(p: StartupProfile, partner: CorporatePartner): { factor: FitFactor; matchedCustomers: string[] } {
  const text = [partner.industry, partner.description, ...partner.focusKeywords, ...partner.businessPriorities]
    .join(" | ")
    .toLowerCase();
  const hitTerms = new Set<string>();
  const matchedCustomers = new Set<string>();
  for (const { term, source } of customerTerms(p)) {
    if (matchesKeyword(text, term)) {
      hitTerms.add(stem(term));
      matchedCustomers.add(source);
    }
  }
  const hits = hitTerms.size;
  const score = hits === 0 ? 0 : Math.min(15, 6 + 3 * hits);
  const detail =
    hits > 0
      ? `${partner.name} resembles your target customers: ${listText([...matchedCustomers].map((c) => c.toLowerCase()), 3)}.`
      : "Does not clearly match your stated target customers.";
  return { factor: { label: "Target customer fit", score, max: 15, detail }, matchedCustomers: [...matchedCustomers] };
}

export function assessPartner(profile: StartupProfile, partner: CorporatePartner): PartnerAssessment {
  const focus = focusFactor(profile, partner.focusKeywords, "organisation");
  const geo = geographyFactor(profile, partner.markets);
  const cap = capabilityFactor(profile, partner.focusKeywords);
  const customer = customerFactor(profile, partner);
  const factors = [focus.factor, geo.factor, cap.factor, customer.factor];
  const fitScore = clampScore(factors.reduce((sum, f) => sum + f.score, 0));

  const reasons: string[] = [];
  if (focus.matched.length > 0) reasons.push(`Shared focus areas: ${listText(focus.matched, 3)}.`);
  if (geo.kind === "primary") reasons.push(`Operates in ${listText(geo.matched, 3)}, including your primary market.`);
  else if (geo.kind === "secondary") reasons.push(`Operates in ${listText(geo.matched, 3)}, one of your expansion markets.`);
  else if (geo.kind === "none") reasons.push(`Operates outside your stated markets (${listText(partner.markets, 3)}).`);
  if (customer.matchedCustomers.length > 0) {
    reasons.push(`Matches your target customers: ${listText(customer.matchedCustomers.map((c) => c.toLowerCase()), 2)}.`);
  }
  reasons.push(
    partner.opportunityType === "published_opportunity"
      ? "Published opportunity confirmed by an official source."
      : `Suggested as a ${PARTNER_CATEGORY_LABEL[partner.category]} — a potential partnership, not a published request.`,
  );

  return {
    partner,
    fitScore,
    factors,
    reasons: reasons.slice(0, 4),
    nextStep: `Prepare a tailored pitch for the ${partner.targetContactRole}`,
  };
}

export function rankPartners(profile: StartupProfile, partners: CorporatePartner[] = corporatePartners): PartnerAssessment[] {
  return partners
    .map((p) => assessPartner(profile, p))
    .sort((a, b) => b.fitScore - a.fitScore || a.partner.name.localeCompare(b.partner.name));
}

// ---------- People ----------

const NEED_PATTERNS: Record<RecommendedPerson["category"], RegExp> = {
  investor: /fund|invest|capital|raise/,
  programme_representative: /fund|grant|programme|program|capital/,
  corporate_contact: /pilot|partner|customer|enterprise|sales/,
  ecosystem_connector: /market|expan|regional|partner|network/,
  mentor: /scale|technical|product|mentor|grow/,
};

function topOpportunityIds(profile: StartupProfile): Set<string> {
  const funding = rankFunding(profile)
    .filter((a) => a.eligibility !== "not_eligible" && a.fitScore >= RELEVANCE_THRESHOLD)
    .slice(0, 3)
    .map((a) => a.opportunity.id);
  const partners = rankPartners(profile)
    .filter((a) => a.fitScore >= RELEVANCE_THRESHOLD)
    .slice(0, 3)
    .map((a) => a.partner.id);
  return new Set([...funding, ...partners]);
}

function opportunityName(id: string): string | undefined {
  return (
    fundingOpportunities.find((o) => o.id === id)?.title ??
    corporatePartners.find((c) => c.id === id)?.name ??
    recommendedPeople.find((r) => r.id === id)?.role
  );
}

function assessPersonWithTop(profile: StartupProfile, person: RecommendedPerson, topIds: Set<string>): PersonAssessment {
  const matched = keywordHits(focusText(profile), person.focusKeywords);
  const target = Math.max(1, Math.min(5, person.focusKeywords.length));
  const keywordScore = Math.round(40 * Math.min(1, matched.length / target));

  const need = profile.growthPriorities.find((gp) => NEED_PATTERNS[person.category].test(gp.toLowerCase()));
  const needScore = need ? (person.category === "mentor" ? 12 : 20) : 0;

  const markets = profile.targetMarkets;
  let geoScore = 0;
  if (markets.length > 0 && samePlace(markets[0], person.country)) geoScore = 10;
  else if (markets.some((m) => samePlace(m, person.country))) geoScore = 8;
  else if (isRegional(person.country) && markets.some(isAsean)) geoScore = 8;

  const related = person.relatedOpportunityId;
  const relatedScore = related ? (topIds.has(related) ? 25 : 10) : 0;
  const relevance = clampScore(keywordScore + needScore + geoScore + relatedScore);

  const reasons: string[] = [];
  if (need) reasons.push(`Relevant to your priority: "${need}".`);
  if (matched.length > 0) reasons.push(`Matches your focus on ${listText(matched, 3)}.`);
  if (related) {
    const name = opportunityName(related);
    if (name) {
      reasons.push(
        topIds.has(related)
          ? `Linked to ${name}, one of your top-ranked opportunities.`
          : `Linked to ${name}.`,
      );
    }
  }
  if (person.contactType === "suggested_role") reasons.push("Suggested role — no individual has been verified.");

  return { person, relevance, reasons: reasons.slice(0, 4) };
}

export function assessPerson(profile: StartupProfile, person: RecommendedPerson): PersonAssessment {
  return assessPersonWithTop(profile, person, topOpportunityIds(profile));
}

export function rankPeople(profile: StartupProfile, people: RecommendedPerson[] = recommendedPeople): PersonAssessment[] {
  const topIds = topOpportunityIds(profile);
  return people
    .map((p) => assessPersonWithTop(profile, p, topIds))
    .sort((a, b) => b.relevance - a.relevance || a.person.role.localeCompare(b.person.role));
}

// ---------- Action plan ----------

export function buildActionPlan(
  profile: StartupProfile,
  funding: FundingAssessment[],
  partners: PartnerAssessment[],
  people: PersonAssessment[],
  isDemo: boolean,
): RoadmapTask[] {
  if (isDemo) return demoTasks.map((t) => ({ ...t, checklist: t.checklist ? [...t.checklist] : undefined }));

  const tasks: RoadmapTask[] = [];
  const topFunding = [...funding]
    .filter((a) => a.fitScore >= RELEVANCE_THRESHOLD && a.eligibility !== "not_eligible")
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3);

  topFunding.forEach((a, i) => {
    const opp = a.opportunity;
    const priority: TaskPriority = i === 0 ? "high" : "medium";
    if (a.unknowns.length > 0) {
      tasks.push({
        id: `gen-funding-confirm-${opp.id}`,
        group: "funding",
        title: `Confirm eligibility for ${opp.title}`,
        relatedOpportunityId: opp.id,
        relatedType: "funding",
        reason: `${opp.title} has a fit score of ${a.fitScore}, but ${a.unknowns.length} mandatory requirement${a.unknowns.length === 1 ? " is" : "s are"} not confirmed: ${a.unknowns.join("; ")}.`,
        nextStep: `Confirm: ${a.unknowns[0]}`,
        priority,
        defaultStatus: "not_started",
        sourceUrl: opp.officialUrl,
        checklist: [...a.unknowns],
      });
    }
    tasks.push({
      id: `gen-funding-prepare-${opp.id}`,
      group: "funding",
      title: `Prepare application materials for ${opp.title}`,
      relatedOpportunityId: opp.id,
      relatedType: "funding",
      reason: `${opp.title} (${opp.organisation}) aligns with your profile${a.reasons[0] ? `: ${a.reasons[0]}` : "."}`,
      nextStep: opp.roadmap[0]?.task ?? "Review the official programme page",
      priority: a.unknowns.length > 0 ? "medium" : priority,
      defaultStatus: "not_started",
      sourceUrl: opp.officialUrl,
      checklist: opp.preparation.map((p) => (p.confirmed ? p.item : `${p.item} (suggested)`)),
    });
  });

  [...partners]
    .filter((a) => a.fitScore >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 2)
    .forEach((a, i) => {
      const partner = a.partner;
      const sourceUrl = partner.evidence[0]?.sourceUrl ?? partner.website;
      tasks.push({
        id: `gen-partner-pitch-${partner.id}`,
        group: "partnerships",
        title: `Prepare a tailored pitch for ${partner.name}`,
        relatedOpportunityId: partner.id,
        relatedType: "partner",
        reason: `${partner.name} is a potential ${PARTNER_CATEGORY_LABEL[partner.category]} with a fit score of ${a.fitScore}. ${a.reasons[0] ?? ""}`.trim(),
        nextStep: a.nextStep,
        priority: i === 0 ? "high" : "medium",
        defaultStatus: "not_started",
        sourceUrl,
      });
      tasks.push({
        id: `gen-partner-poc-${partner.id}`,
        group: "partnerships",
        title: `Define POC success metrics with ${partner.name}`,
        relatedOpportunityId: partner.id,
        relatedType: "partner",
        reason: "Measurable outcomes make a proof of concept easier to approve and evaluate.",
        nextStep: `Draft proposed metrics for: ${partner.collaboration.pilotScope}`,
        priority: "medium",
        defaultStatus: "not_started",
        sourceUrl,
        checklist: [...partner.collaboration.successMetrics],
      });
    });

  [...people]
    .filter((a) => a.relevance >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 2)
    .forEach((a, i) => {
      const person = a.person;
      const who = person.name ?? person.role;
      tasks.push({
        id: `gen-person-intro-${person.id}`,
        group: "network",
        title: `Request an introduction to ${who}`,
        relatedOpportunityId: person.id,
        relatedType: "person",
        reason: person.relevanceExplanation,
        nextStep: person.reasonToConnect,
        priority: i === 0 ? "medium" : "low",
        defaultStatus: "not_started",
        sourceUrl: person.publicProfileUrl,
      });
    });

  return tasks;
}
