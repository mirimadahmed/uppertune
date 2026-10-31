import { z } from "zod";

const EMPTY_MARKERS = new Set([
  "",
  "unknown",
  "not stated",
  "not specified",
  "n/a",
  "na",
  "none",
  "null",
  "undefined",
  "not available",
  "not mentioned",
]);

/** Lenient string list: accepts null, a single string or mixed values; trims, dedupes and drops empties. */
export const stringList = z.preprocess(
  (value) => {
    if (value == null) return [];
    if (typeof value === "string") return [value];
    return value;
  },
  z
    .array(z.union([z.string(), z.number()]))
    .transform((items) => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const raw of items) {
        const item = String(raw).replace(/\s+/g, " ").trim();
        const key = item.toLowerCase();
        if (!item || EMPTY_MARKERS.has(key) || seen.has(key)) continue;
        seen.add(key);
        out.push(item);
      }
      return out.slice(0, 12);
    }),
);

/** Optional string that treats null / "unknown" / "not stated" as absent. */
const optionalText = z.preprocess(
  (value) => {
    if (value == null) return undefined;
    if (typeof value !== "string") return String(value);
    const trimmed = value.trim();
    return EMPTY_MARKERS.has(trimmed.toLowerCase()) ? undefined : trimmed;
  },
  z.string().optional(),
);

const requiredText = (fallback?: string) =>
  z.preprocess(
    (value) => {
      const text = value == null ? "" : String(value).replace(/\s+/g, " ").trim();
      return text || fallback || text;
    },
    z.string().min(1, "must be a non-empty string"),
  );

export const startupProfileSchema = z.object({
  name: requiredText(),
  website: optionalText,
  description: requiredText(),
  industry: stringList,
  products: stringList,
  businessModel: requiredText("Not stated"),
  targetCustomers: stringList,
  targetMarkets: stringList,
  capabilities: stringList,
  technologies: stringList,
  competitiveAdvantages: stringList,
  stage: optionalText,
  incorporationCountry: optionalText,
  growthPriorities: stringList,
  missingInformation: stringList,
  assumptions: stringList,
});

export type ParsedStartupProfile = z.infer<typeof startupProfileSchema>;

export const generatedSectionSchema = z.object({
  heading: requiredText(),
  body: requiredText(),
});

export const generatedDocumentSchema = z.object({
  title: requiredText(),
  sections: z.array(generatedSectionSchema).min(1, "must contain at least one section"),
});

export type ParsedGeneratedDocument = z.infer<typeof generatedDocumentSchema>;

const normaliseHeading = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Schema for a generated document that must contain the given headings.
 * Output sections are returned in the required order with the canonical heading text.
 */
export function sectionsSchemaFor(requiredHeadings: string[]) {
  return generatedDocumentSchema.transform((doc, ctx) => {
    const byHeading = new Map(doc.sections.map((s) => [normaliseHeading(s.heading), s]));
    const missing = requiredHeadings.filter((h) => !byHeading.has(normaliseHeading(h)));
    if (missing.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `sections must use exactly these headings in this order: ${requiredHeadings
          .map((h) => `"${h}"`)
          .join(", ")}. Missing: ${missing.map((h) => `"${h}"`).join(", ")}`,
      });
      return z.NEVER;
    }
    return {
      title: doc.title,
      sections: requiredHeadings.map((heading) => ({
        heading,
        body: byHeading.get(normaliseHeading(heading))!.body,
      })),
    };
  });
}

// ---------- API request schemas ----------

export const extractRequestSchema = z.object({
  url: z.string().trim().min(1).max(2048),
});

export const extractedPageSchema = z.object({
  url: z.string().max(2048),
  title: z.string().max(1000).default(""),
  description: z.string().max(4000).default(""),
  headings: z.array(z.string().max(500)).max(40).default([]),
  text: z.string().max(20000).default(""),
});

export const analyzeRequestSchema = z
  .object({
    url: z.string().trim().max(2048).optional(),
    page: extractedPageSchema.optional(),
    founderDescription: z.string().trim().max(4000).optional(),
  })
  .refine((req) => Boolean(req.page) || Boolean(req.founderDescription && req.founderDescription.length >= 10), {
    message: "Provide extracted website content or a founder description of at least 10 characters.",
  });

export const generateRequestSchema = z.object({
  kind: z.enum(["pitch", "poc", "intro", "strategy"]),
  targetId: z.string().trim().min(1).max(200),
  profile: startupProfileSchema,
});
