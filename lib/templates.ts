import { corporatePartners } from "@/data/corporate-partners";
import { fundingOpportunities } from "@/data/funding-opportunities";
import { recommendedPeople } from "@/data/people";
import { assessFunding } from "@/lib/matching";
import { REQUIRED_HEADINGS } from "@/lib/prompts";
import type {
  CorporatePartner,
  FundingOpportunity,
  GenerateKind,
  GeneratedDocument,
  GeneratedSection,
  RecommendedPerson,
  StartupProfile,
} from "@/lib/types";

export const TEMPLATE_NOTE =
  "Demo intelligence — generated from UpperTune templates because the AI model is not configured or unavailable.";

export type GenerationTarget =
  | { kind: "strategy"; opportunity: FundingOpportunity }
  | { kind: "pitch" | "poc"; partner: CorporatePartner }
  | { kind: "intro"; person: RecommendedPerson };

/** Looks up the dataset record a generation request refers to. Returns null for unknown ids. */
export function resolveTarget(kind: GenerateKind, targetId: string): GenerationTarget | null {
  if (kind === "strategy") {
    const opportunity = fundingOpportunities.find((o) => o.id === targetId);
    return opportunity ? { kind, opportunity } : null;
  }
  if (kind === "pitch" || kind === "poc") {
    const partner = corporatePartners.find((p) => p.id === targetId);
    return partner ? { kind, partner } : null;
  }
  const person = recommendedPeople.find((p) => p.id === targetId);
  return person ? { kind: "intro", person } : null;
}

// ---------- helpers ----------

const sentence = (text: string) => {
  const t = text.trim();
  if (!t) return t;
  return /[.!?…]$/.test(t) ? t : `${t}.`;
};

const lowerFirst = (text: string) =>
  !text || /^[A-Z]{2}/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);

function joinList(items: string[], fallback: string, max = 3): string {
  const picked = items.slice(0, max).map((i) => lowerFirst(i.trim())).filter(Boolean);
  if (picked.length === 0) return fallback;
  if (picked.length === 1) return picked[0];
  return `${picked.slice(0, -1).join(", ")} and ${picked[picked.length - 1]}`;
}

/** "CanopyIQ is an AI-powered …" from a description starting with an article; otherwise "CanopyIQ: …". */
function describeStartup(profile: StartupProfile): string {
  const desc = profile.description.trim();
  if (!desc) return `${profile.name} [add a one-line description of what you do].`;
  if (/^(a|an|the)\s/i.test(desc)) return sentence(`${profile.name} is ${lowerFirst(desc)}`);
  if (desc.toLowerCase().startsWith(profile.name.toLowerCase())) return sentence(desc);
  return sentence(`${profile.name} — ${desc}`);
}

const bullets = (lines: string[]) =>
  lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `- ${l.replace(/^-\s*/, "")}`)
    .join("\n");

const primaryProduct = (profile: StartupProfile) => profile.products[0] ?? "solution";

// ---------- per-kind templates ----------

function pitchSections(profile: StartupProfile, partner: CorporatePartner): GeneratedSection[] {
  const c = partner.collaboration;
  const [h1, h2, h3, h4, h5, h6] = REQUIRED_HEADINGS.pitch(partner.name);
  const priority = partner.businessPriorities[0];
  return [
    {
      heading: h1,
      body: `I'm [Your name], founder of ${profile.name}. ${describeStartup(profile)} I'm reaching out because ${partner.name}'s work in ${lowerFirst(partner.industry)}${priority ? `, including its stated focus on ${lowerFirst(priority.replace(/\.$/, ""))},` : ""} connects directly with what we build.`,
    },
    { heading: h2, body: sentence(c.problem) },
    {
      heading: h3,
      body: `${sentence(c.solution)} It draws on ${profile.name}'s ${joinList(profile.capabilities, "core capabilities")}. Relevant results so far: [add a measurable pilot outcome or customer reference, if you have one].`,
    },
    { heading: h4, body: sentence(c.businessValue) },
    {
      heading: h5,
      body: `${sentence(c.pilotScope)}\n${bullets(c.successMetrics.map((m) => `Success metric: ${m}`))}`,
    },
    {
      heading: h6,
      body: `Would the ${partner.targetContactRole} team be open to a 30-minute conversation to test whether this pilot is a fit for ${partner.name}? I can share a short product walkthrough and a draft pilot plan in advance. [Add your availability]`,
    },
  ];
}

function pocSections(profile: StartupProfile, partner: CorporatePartner): GeneratedSection[] {
  const c = partner.collaboration;
  const [h1, h2, h3, h4, h5, h6, h7, h8] = REQUIRED_HEADINGS.poc();
  return [
    {
      heading: h1,
      body: `Run a time-boxed proof of concept to test whether ${profile.name}'s ${lowerFirst(primaryProduct(profile))} can deliver measurable value for ${partner.name} in ${lowerFirst(partner.industry)}, with agreed success criteria before any wider rollout.`,
    },
    { heading: h2, body: sentence(c.problem) },
    {
      heading: h3,
      body: `${sentence(c.solution)}${profile.technologies.length ? ` Technology involved: ${joinList(profile.technologies, "", 3)}.` : ""} Integration requirements with ${partner.name}'s existing systems: [to be confirmed with ${partner.name}].`,
    },
    { heading: h4, body: `${sentence(c.pilotScope)} Sites, data sources and duration are to be agreed jointly.` },
    {
      heading: h5,
      body: bullets([
        ...c.successMetrics,
        `Baseline for each metric: [agree baseline measurements with ${partner.name} before the pilot starts]`,
      ]),
    },
    {
      heading: h6,
      body: `${bullets([
        "Weeks 1–2: confirm scope, data access, baselines and success criteria",
        "Weeks 3–8: deploy on the agreed pilot scope and review results every two weeks",
        "Weeks 9–10: evaluate outcomes against the success metrics and agree next steps",
      ])}\nIllustrative only — no delivery estimate has been confirmed.`,
    },
    {
      heading: h7,
      body: bullets([
        `${partner.targetContactRole} (${partner.name}) — sponsor`,
        `Operational lead for the pilot scope (${partner.name}) [role to be confirmed]`,
        `Data or IT owner for integration (${partner.name}) [role to be confirmed]`,
        `${profile.name} founder and technical lead [add names]`,
      ]),
    },
    {
      heading: h8,
      body: bullets([
        `Send a short introduction to the ${partner.targetContactRole} team`,
        "Share this outline and a product demonstration",
        "Agree pilot scope, data access and success metrics in a working session",
        "Confirm commercial terms for the pilot [to be agreed]",
      ]),
    },
  ];
}

function introSections(profile: StartupProfile, person: RecommendedPerson): GeneratedSection[] {
  const greeting = person.contactType === "verified_person" && person.name ? `Dear ${person.name},` : "Dear [Name],";
  const focus = joinList(person.expertise, lowerFirst(person.category.replace(/_/g, " ")), 2);
  return [
    {
      heading: "Message",
      body: [
        greeting,
        `I'm [Your name], founder of ${profile.name}. ${describeStartup(profile)}`,
        `I'm reaching out because of your role as ${person.role} at ${person.organisation}. ${sentence(person.reasonToConnect)}`,
        `I would value your perspective on ${focus}, particularly as we work towards ${lowerFirst(profile.growthPriorities[0] ?? "our next growth milestone")}.`,
        "Would you be open to a 20-minute call in the coming weeks? I'm happy to work around your schedule.",
        `Best regards,\n[Your name]\n[Your role], ${profile.name}\n[Your email]`,
      ].join("\n\n"),
    },
  ];
}

function strategySections(profile: StartupProfile, opp: FundingOpportunity): GeneratedSection[] {
  const assessment = assessFunding(profile, opp);
  const [h1, h2, h3] = REQUIRED_HEADINGS.strategy();
  const met = assessment.criteria.filter((c) => c.result === "meets");
  const gaps = assessment.criteria.filter((c) => c.result !== "meets" && c.criterion.mandatory);
  const optionalGaps = assessment.criteria.filter((c) => c.result !== "meets" && !c.criterion.mandatory);

  const strong = [
    ...met.map((c) => `${c.criterion.requirement}: ${lowerFirst(c.explanation)}`),
    ...assessment.reasons.slice(0, 2),
  ];

  const unconfirmedPrep = opp.preparation.filter((p) => !p.confirmed).slice(0, 1);
  const strengthen = [
    `Explain how ${profile.name}'s ${lowerFirst(primaryProduct(profile))} would be deployed commercially${opp.country ? ` in ${opp.country}` : ""} and what measurable outcomes the project will produce: [add target outcomes].`,
    opp.focusKeywords.length
      ? `Map your capabilities (${joinList(profile.capabilities, "your core capabilities", 2)}) explicitly to the programme's focus on ${joinList(opp.focusKeywords, "its stated themes", 2)}.`
      : "",
    "Back every claim with evidence: [add traction, pilot results or letters of intent, if you have them].",
    ...unconfirmedPrep.map((p) => `Prepare ${lowerFirst(p.item.replace(/\.$/, ""))} (suggested preparation, not a confirmed requirement).`),
  ];

  const close = [
    ...gaps.map((c) =>
      c.result === "not_met"
        ? `Resolve: ${c.criterion.requirement} — ${lowerFirst(c.explanation)}`
        : `Confirm: ${c.criterion.requirement} — ${lowerFirst(c.explanation)}`,
    ),
    ...optionalGaps.slice(0, 1).map((c) => `Check: ${c.criterion.requirement} (not mandatory)`),
    ...profile.missingInformation.slice(0, 2).map((m) => `Provide missing information: ${lowerFirst(m)}`),
    `Confirm current intake dates and requirements on the official ${opp.organisation} source before applying.`,
  ];

  return [
    {
      heading: h1,
      body: strong.length
        ? bullets(strong.slice(0, 4))
        : "No criteria could be confirmed as met from the current profile yet. Complete the missing information below so the assessment can be finished.",
    },
    { heading: h2, body: bullets(strengthen) },
    { heading: h3, body: bullets(close.slice(0, 6)) },
  ];
}

export function templateTitle(kind: GenerateKind, profile: StartupProfile, target: GenerationTarget): string {
  switch (target.kind) {
    case "strategy":
      return `Application strategy: ${target.opportunity.title}`;
    case "intro":
      return `Introduction request: ${target.person.role}, ${target.person.organisation}`;
    default:
      return kind === "poc"
        ? `POC outline: ${profile.name} × ${target.partner.name}`
        : `Partnership proposal: ${profile.name} × ${target.partner.name}`;
  }
}

/** Deterministic fallback document (demo intelligence) built from the profile and the dataset record. */
export function templateDocument(kind: GenerateKind, targetId: string, profile: StartupProfile): GeneratedDocument {
  const target = resolveTarget(kind, targetId);
  if (!target) throw new Error(`Unknown ${kind} target: ${targetId}`);

  let sections: GeneratedSection[];
  switch (target.kind) {
    case "strategy":
      sections = strategySections(profile, target.opportunity);
      break;
    case "intro":
      sections = introSections(profile, target.person);
      break;
    default:
      sections = kind === "poc" ? pocSections(profile, target.partner) : pitchSections(profile, target.partner);
  }

  return {
    kind,
    targetId,
    title: templateTitle(kind, profile, target),
    sections,
    source: "template",
    generatedAt: new Date().toISOString(),
    note: TEMPLATE_NOTE,
  };
}
