# UpperTune — Project description

**Know your opportunities. Make them happen.**

- **Hackathon:** Hacktoberfest Hack Day KL 2026 (MLH)
- **Category:** Best Use of Gemma 4
- **Repository:** https://github.com/mirimadahmed/uppertune (MIT licence)
- **Live demo:** https://sing-ftp-mirrors-exercise.trycloudflare.com
- **Demo video:** _link to be added_

## Problem statement tackled

**Problem Statement 1:** "How can Startup ASEAN successfully convert ecosystem connections into measurable outcomes, including investments, commercial partnerships, market expansion, and cross-border POCs?"

## The problem

ASEAN startups are surrounded by connections — funding programmes, accelerators, corporates looking for innovation partners, mentors and ecosystem connectors — but very few of those connections become investments, partnerships or pilots. Founders do not know which opportunities actually fit their startup, whether they meet the eligibility criteria, what to say to a potential partner, or who to approach first. The research and writing involved is slow, generic outreach gets ignored, and there is no simple way to track whether a connection is turning into an outcome.

## The solution

UpperTune is a growth-intelligence workspace for ASEAN startups. A founder enters their startup website; UpperTune builds a structured company profile with Gemma 4, matches it against a curated set of ASEAN funding programmes, partner organisations and people, and turns the results into an evidence-backed action plan:

- **Funding** — programmes ranked by fit score, with a criterion-by-criterion eligibility assessment (meets / does not meet / needs confirmation), a preparation checklist, a roadmap, sources and a Gemma 4 application strategy.
- **Partnerships** — organisations whose documented priorities fit the startup, with a proposed pilot, a suggested contact role, and a Gemma 4-generated tailored pitch and proof-of-concept (POC) outline that the founder can regenerate, edit and copy.
- **People** — mentors, programme representatives and connectors (named only when a public source verifies them; otherwise a suggested role), with Gemma 4 introduction-request drafts.
- **Action plan** — prioritised tasks across funding, partnerships and networking with progress tracking.

This converts loose ecosystem connections into concrete, trackable next steps: applications to submit, pitches and cross-border POC proposals to send, and introductions to request.

## How it works

1. **Single-page website extraction** (`lib/website.ts`) — fetches only the submitted page with SSRF protection (private, loopback and cloud-metadata addresses blocked, re-validated redirects, timeout and size cap) and extracts the title, metadata, headings and trimmed body text. If the site cannot be read, the founder can provide a short description instead.
2. **Gemma 4 profile extraction** (`/api/analyze-startup`) — Gemma 4 turns the page content into a structured `StartupProfile`. Facts must come from the content; stage, revenue, funding, employees and customers are never invented — unknowns go to `missingInformation` and inferences to `assumptions`.
3. **Deterministic matching engine** (`lib/matching.ts`) — computes fit scores and eligibility transparently. The model explains; it does not decide.
4. **Gemma 4 document generation** (`/api/generate`) — funding application strategies, partnership pitches, POC outlines and introduction requests, each grounded in the profile and the dataset record.
5. **Robustness** — every model response is validated with Zod and retried once with the validation error; calls time out and fall back between `gemma-4-26b-a4b-it` (default, fast mixture-of-experts) and `gemma-4-31b-it`; if no API key is configured or a call fails, deterministic templates are used and labelled *Demo intelligence*. The API key never leaves the server.
6. **Provenance labels** — every item is marked *Verified*, *Needs confirmation*, *AI assessment*, *Potential partnership* or *Illustrative*, so founders know what to trust.

## Technologies used

- **Gemma 4** (`gemma-4-26b-a4b-it`, `gemma-4-31b-it`) via the Gemini API and the Google Gen AI SDK (`@google/genai`)
- **Next.js 16** (App Router, server-side API routes), **React**, **TypeScript**
- **Tailwind CSS**, **shadcn/ui** and Radix UI components
- **Zod** for validating model output
- Browser `localStorage` for the workspace and action-plan progress (no server-side persistence)

## Target users

- Early-stage startup founders in Southeast Asia looking for funding, corporate partners, market expansion and cross-border pilots
- Accelerators, ecosystem builders and programme managers (such as Startup ASEAN) who want the startups they support to convert introductions into measurable outcomes

## What makes it unique

- **Evidence over hype** — a transparent, deterministic matching engine decides fit and eligibility; Gemma 4 explains and writes, but never invents traction, people, deadlines or amounts. Unknowns stay *needs confirmation*.
- **From connection to action** — it does not stop at a list of matches: it produces the pitch, the POC outline, the introduction request and a tracked action plan for each opportunity.
- **Honest provenance** — every claim is labelled by source type, and named people appear only when publicly verified.
- **Practical use of Gemma 4** — the fast Gemma 4 mixture-of-experts model with thinking switched off for reliable structured JSON, schema validation with retry, automatic fallback to the other Gemma 4 model, and graceful template fallback, so the demo never ends on a blank screen.
- **One input** — just a website URL (or a short description) to get a full, ASEAN-specific growth workspace.

_Prototype note: the opportunity dataset is a small curated sample, and CanopyIQ, the guided-demo startup, is fictional._
