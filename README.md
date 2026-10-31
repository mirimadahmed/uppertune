# UpperTune

**Know your opportunities. Make them happen.**

UpperTune is an intelligence platform that helps startups discover, evaluate and pursue growth opportunities across the ASEAN ecosystem: funding programmes, corporate partnerships and the people who can help them grow.

A founder enters their startup website. UpperTune reads that single page, uses **Gemma 4** to build a structured company profile, compares it against a curated set of ASEAN opportunities with a transparent, deterministic matching engine, and turns the results into an evidence-backed action plan with tailored pitches, proof-of-concept outlines and introduction drafts.

> Hackathon prototype. CanopyIQ, the demo startup, is fictional.

---

## The core journey

1. **Landing (`/`)** — enter your website or open the guided demo.
2. **Analysis (`/analyze`)** — four real stages: understanding your startup (single-page fetch), building your company profile (Gemma 4), evaluating relevant opportunities (matching engine), preparing your growth roadmap.
3. **Workspace (`/app`)** — overview, funding, partnerships, people and action plan, all generated for your profile.

## Features by screen

| Screen | What it does |
| --- | --- |
| Landing | Explains the product, URL input with validation/normalisation, illustrative product preview, provenance principles, ASEAN ecosystem. |
| Analysis | Shows the four stages with real status (pending, running, done, error). Handles unreachable websites (asks for a short founder description), missing API keys and model errors, and never ends on a blank screen. |
| Overview | Startup profile summary, opportunity counts, priority opportunities and actions. |
| Funding | Programmes ranked by fit score (relevance, not acceptance probability), criteria-by-criteria eligibility assessment (meets / does not meet / needs confirmation), preparation checklist, roadmap, AI application strategy and sources. |
| Partnerships | Organisations whose documented priorities fit the startup, clearly marked as *published opportunity* or *potential partnership*; proposed pilot, suggested contact role, tailored pitch and POC outline (regenerate, edit, copy). |
| People | Mentors, programme representatives and connectors. Named people appear only when a public source verifies them; otherwise a suggested role is shown. Personalised introduction drafts. |
| Action plan | Prioritised tasks across funding, partnerships and networking with progress tracking (stored locally). |

## How Gemma 4 is used

All model calls run on the server (`lib/gemma.ts`) through the Google Gen AI SDK (`@google/genai`) and the Gemini API, using `gemma-4-31b-it` by default (configurable with `GEMMA_MODEL`).

Four AI tasks:

1. **Startup profile extraction** (`/api/analyze-startup`) — title, metadata, headings and trimmed page text (plus an optional founder description) become a structured `StartupProfile`. Facts must come from the content; stage, incorporation, revenue, funding history, employees and customers are never invented. Unknowns go to `missingInformation`, inferences to `assumptions`.
2. **Funding application strategy** (`/api/generate`, `kind: "strategy"`) — explains the fit using the deterministic eligibility result. Unknown criteria stay unknown; the model must not turn them into positive claims.
3. **Partnership pitch and POC outline** (`kind: "pitch"` / `"poc"`) — tailored to the organisation's documented context, without claiming the organisation requested anything.
4. **Introduction requests** (`kind: "intro"`) — short, polite messages with placeholders such as `[Your name]`.

Robustness:

- **Deterministic matching engine** (`lib/matching.ts`) computes fit scores and eligibility; the model explains, it does not decide.
- **Zod validation** of every model response (`lib/ai-schemas.ts`), with **one retry** that includes the validation error. Code fences and stray prose are stripped before parsing. Each call has a 45-second timeout.
- **Template fallback** (`lib/templates.ts`): when no API key is configured or a call fails, documents are generated deterministically from the profile and the dataset record and labelled *Demo intelligence*.
- Model output is always labelled as AI assessment and is never presented as an official source. The API key never leaves the server.

## Website extraction

`lib/website.ts` fetches only the submitted page: http/https only, no embedded credentials, localhost / private / link-local / loopback / CGNAT / cloud-metadata addresses blocked (every DNS answer is checked, IPv4 and IPv6, including IPv4-mapped addresses), at most 3 redirects (each hop re-validated), 8-second timeout, 1.5 MB download cap, HTML only. It extracts the title, meta description, up to 20 headings and up to 6,000 characters of cleaned body text. No crawling.

## Setup

Requirements: Node.js 22+.

```bash
npm install
cp .env.example .env.local   # add your GEMINI_API_KEY (optional for the demo)
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

Environment variables:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API key used to call Gemma 4. Optional: without it the guided demo and template fallbacks still work. |
| `GEMMA_MODEL` | Model name, default `gemma-4-31b-it`. |

## Two-minute judge demo

1. **Landing** — read the headline, note the product preview, click **Explore demo**.
2. **Analysis** — watch the four stages complete for the illustrative CanopyIQ profile; review the summary and click **Enter your workspace**.
3. **Overview** — profile summary, opportunity counts, priority actions.
4. **Funding detail** — open the top programme: fit score, eligibility table with *needs confirmation* items, preparation checklist, roadmap and sources. Generate the application strategy.
5. **Partnership pitch** — open a partnership, note the *potential partnership* label, generate the pitch, **edit** it and **copy** it. Generate a POC outline.
6. **People** — open a recommendation, see verified person vs suggested role, generate an introduction request.
7. **Action plan** — tick off tasks and watch progress update.
8. Optional, with `GEMINI_API_KEY` set: go back to the landing page and analyse a real startup website.

## Data provenance

- **Verified** — programme and organisation facts taken from official or public professional sources, linked with the date they were checked.
- **Needs confirmation** — anything a source does not state (intake dates, amounts, criteria the profile cannot prove) is marked as such. Deadlines and funding amounts are shown only when sourced.
- **AI assessment** — Gemma 4 output: profiles, strategies, pitches, POC outlines and introductions.
- **Potential partnership** — inferred by UpperTune from public business context; the organisation has not requested it.
- **Illustrative** — CanopyIQ is a fictional startup. Its stage, markets and priorities are demo assumptions; it has no stated revenue, customers, employees or funding.

Naming an organisation does not imply a partnership with or endorsement by it. Always verify details with the official source before applying.

## Project structure

```
app/
  page.tsx                  Landing page
  analyze/page.tsx          Analysis flow
  app/                      Workspace (overview, funding, partnerships, people, action plan)
  api/extract/              Single-page website extraction
  api/analyze-startup/      Gemma 4 profile extraction
  api/generate/             Gemma 4 documents with template fallback
components/
  landing/                  Landing sections, URL form, product preview
  analyze/                  Analysis stages and results
  shared/, ui/              Shared and shadcn/ui components
data/                       Curated demo dataset (funding, partners, people, demo startup)
lib/
  types.ts                  Shared domain types
  matching.ts               Deterministic fit and eligibility engine
  gemma.ts                  Server-only Gemma 4 client (JSON + Zod + retry)
  ai-schemas.ts             Zod schemas
  prompts.ts                Task-specific prompts
  templates.ts              Deterministic fallback documents
  website.ts                SSRF-safe page extraction
  workspace.tsx             Client workspace state (localStorage)
```

## Limitations

- The opportunity dataset is a small curated sample, not a live database; programme details can change.
- Extraction reads one page and cannot render JavaScript-only sites (the founder description fallback covers this).
- Fit scores are relevance measures, not predictions of acceptance.
- No authentication or server-side persistence; the workspace is stored in the browser.
- Gemma output can be wrong; the profile and drafts should be reviewed before use.

## Licence

MIT — see [LICENSE](./LICENSE). MIT was chosen as a default; confirm the hackathon's required licence.
