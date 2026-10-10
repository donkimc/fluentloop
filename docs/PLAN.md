# FluentLoop — MVP & Expansion Plan

> Status: draft for review · No code written yet.
> Every price in this document is an estimate from late-2026 research. Re-check vendor pricing pages before committing.

## 1. Product summary

FluentLoop builds a personalized English curriculum for each learner. It starts from a short placement test, then adapts every day based on the learner's results. It is AI-generated, copyright-free, and tracked over time.

**Beachhead market:** Korean hagwons (private academies), sold as a B2B per-student license.
- Teachers get daily auto-generated assignments and progress reports.
- Students get material pitched at their actual level.

**Why this niche:**
- The general "AI English tutor" market is a red ocean (Speak, Praktika, Duolingo Max, ChatGPT Voice).
- Hagwons pay for **reporting and teacher time saved**, which consumer apps don't compete on.

**Core loop:**

```
Placement test → skill profile (CEFR per skill)
      ↓
Nightly: generate tomorrow's set per class + per-student remedial items → automatic QA
      ↓
Student does daily set (MCQ, reading, listening, writing, shadowing)
      ↓
Answers → error log (skill, grammar point, word) → updated skill profile
      ↓
Teacher dashboard + weekly report          (loop repeats)
```

## 2. Key decisions so far

| Area | Decision | Reason |
|---|---|---|
| Market | Hagwons (B2B), Korea | Blue-ish pocket; reporting is the differentiator |
| Pronunciation scoring | **Not in MVP** | Was ~2/3 of AI cost; add later as premium |
| Speech-to-text | **Not in MVP** | Later: in-browser Whisper/Moonshine (MIT), $0 server cost |
| Speaking in MVP | **Shadowing** (listen → record → compare, all on-device) | Zero cost, no audio upload, no minors'-voice data stored |
| Text-to-speech | **Open source:** Kokoro (Apache-2.0) or Piper (MIT code; check each voice's license) | ~$0, runs in the nightly job, audio cached |
| LLM | Budget model for volume (e.g. Claude Haiku 5.5); stronger model (e.g. Claude Sonnet 5.5) for placement, curriculum and QA | ~$0.03 vs ~$0.57 per student per month for generation |
| LLM vendor | Behind a provider interface; pick by eval results | Swap by config; avoid DeepSeek's first-party API for minors' data (China processing, Korean PIPC history) |
| Hosting | Render web service + Render cron (Singapore region) | Cheap, simple, Docker-portable |
| Database | Neon Postgres (Singapore) | Usage-based, scales to zero; Supabase Seoul if in-country storage is required |
| File storage | Cloudflare R2 | Free egress for audio |

## 3. MVP scope

### 3.1 Users and roles

| Role | Can do |
|---|---|
| Hagwon admin | Create the academy, invite teachers, see all classes, export reports |
| Teacher | Create classes, issue student accounts or join codes, view dashboards, review and flag items, override grades |
| Student | Placement test, daily set, see own progress |

Parents are out of scope for the MVP. Teachers share printable or exported reports instead.

### 3.2 Features (in build order)

1. **Accounts and tenancy:** academy → classes → students.
   - Students get teacher-issued accounts (username + PIN or join code). We don't collect student emails.
   - Under-14 parental consent is collected by the hagwon, using our consent template.
2. **Curriculum backbone:**
   - CEFR levels A1–C1, split into skills: grammar, vocabulary, reading, listening, writing.
   - Grammar-point list and vocabulary lists built from openly licensed sources (e.g. NGSL; verify the license).
   - Stored as data, not prompts.
3. **Placement test:**
   - About 25–35 min of mixed MCQ, a short reading/listening section and one writing prompt.
   - Output: an estimated CEFR level for each skill.
   - The teacher can adjust the result.
4. **Nightly generation pipeline** (Render cron):
   - Per class level, generate the shared daily set:
     - 10–15 MCQ (grammar/vocabulary)
     - 1 reading passage with questions
     - 1 listening clip with questions
     - 1 writing prompt with a model answer
     - 3–5 shadowing sentences
   - Per student, add 3–5 remedial items from their error log.
   - Use the batch LLM API (50% off).
   - Generate audio with TTS → upload to R2.
   - Every item passes automatic QA (§5) before it is published. Failed items are regenerated or dropped.
5. **Student daily set:**
   - Mobile-first web app (PWA).
   - Instant scoring for MCQ.
   - Writing is graded by AI with a rubric score, inline corrections, a short explanation (Korean + English) and a model answer.
6. **Shadowing:** play the TTS sentence → record → play both back. Recording stays in the browser and is never uploaded.
7. **Progress tracking:**
   - Student view: streak, skill bars, recent mistakes.
   - Skill estimates update after every attempt (simple Elo/IRT-style rating per skill).
8. **Teacher dashboard:**
   - Class completion today and this week.
   - Weakest grammar points and words across the class.
   - Per-student drill-down.
   - Flag a bad item (feeds evals), override a writing grade.
9. **Weekly report:** printable page / PDF per student, for parents, shared via the teacher.

### 3.3 Explicitly NOT in MVP

Pronunciation scoring, speech-to-text, live AI conversation, parent accounts, payments/billing, native apps, B2C sign-up, KakaoTalk notifications.

### 3.4 MVP success criteria (end of pilot)

- 2–3 hagwons, 100–300 active students, 6–8 weeks.
- ≥ 60% of assigned daily sets completed.
- Teacher-flagged bad items < 2% of items served.
- At least 1 hagwon says it would pay, and at what price per student.
- AI + infra cost ≤ ~$0.30 per active student per month (target).

## 4. Architecture

### 4.1 Stack

| Layer | Choice |
|---|---|
| Language | TypeScript everywhere (strict mode) |
| Web app | Next.js (App Router), PWA |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) |
| i18n | Korean + English UI (`next-intl`) |
| DB access | Drizzle ORM + SQL migrations |
| Auth | Better Auth (open source, sessions in our DB) |
| Validation | Zod: shared schemas for API, LLM structured outputs and forms |
| Jobs | Render cron → `worker` app (same repo, same Docker image) |
| TTS | Kokoro (kokoro-js) or Piper CLI inside the worker image (decide in a spike) |
| Storage | Cloudflare R2 (S3-compatible API) |
| LLM | Provider interface in `packages/ai`; Anthropic SDK first |
| Monitoring | Sentry (errors), uptime pinger, structured JSON logs |

### 4.2 Repository layout (monorepo, pnpm workspaces)

```
apps/
  web/        Next.js app (student, teacher, admin UIs + API routes)
  worker/     nightly generation, QA, TTS, report jobs
packages/
  core/       domain logic: curriculum, skill rating, scheduling (no I/O)
  db/         Drizzle schema, migrations, data-access layer (tenant-scoped)
  ai/         LLM provider interface, prompts, output schemas
  evals/      eval datasets, graders, runner, reports
  ui/         shared components and design tokens
docs/         plan, ADRs, conventions
```

### 4.3 Core data model (first draft)

- `organizations`, `users`, `memberships(role)`, `classes`, `enrollments`
- `curriculum_nodes` (level, skill, grammar point / vocabulary set)
- `items`: question bank, with these fields:
  - type
  - content JSON
  - answer key
  - CEFR level
  - tags
  - generation metadata (model, prompt version)
  - QA status
  - flag count
- `daily_sets`, `daily_set_items` (per class and per student)
- `attempts`, `responses` (answer, correctness, AI feedback JSON, grader version)
- `error_events` (student, skill, grammar point, word, item) — the data moat
- `skill_estimates` (student × skill → rating, confidence, history)
- `assets` (R2 key, type, owning item)
- `audit_log`

### 4.4 Request vs. batch split

- **Nightly (batch):** all content generation, QA and TTS. This is cheap and fast for students.
- **Live (request):**
  - MCQ scoring, which is deterministic with no LLM.
  - Writing feedback: one small LLM call. It is queued and can also be graded in a batch if latency allows.

## 5. Evals (before features ship)

Evals gate every prompt or model change. They run in CI: a subset on each PR, the full set nightly.

| # | Eval | Method | Initial bar |
|---|---|---|---|
| E1 | Output schema validity | Zod parse of every generated item | 100% |
| E2 | MCQ has exactly one correct answer | Independent model solves the item without the key; must match the key and find no second valid option | ≥ 98% agreement |
| E3 | Level fit (CEFR) | Vocabulary-list coverage + readability metrics + LLM judge against level descriptors | ≥ 90% within ±1 sub-level |
| E4 | Copyright / originality | No long verbatim overlap with known texts (n-gram check), no song lyrics or book passages, no trademarked exam names (IELTS/TOEIC/TOEFL) | 0 violations |
| E5 | Age-appropriate & safe | Classifier / LLM judge on topics (minors as audience) | 0 violations |
| E6 | Writing grader agreement | AI rubric score vs. teacher-scored gold set | QWK ≥ 0.7 |
| E7 | Korean explanation correctness | LLM judge + teacher spot-check sample | ≥ 95% |
| E8 | Placement accuracy | Placement result vs. teacher's judgment on pilot students | ≥ 80% within ±1 level |
| E9 | Cost & latency | Tokens and $ per daily set; p95 writing feedback latency | within budget |

- **Gold sets:** start with ~100 hand-checked items per type. Grow the set from items flagged by teachers in the pilot.
- **Production QA:** E1, E2, E4 and E5 also run on every generated item before it is published. Failures are regenerated or dropped.

## 6. Engineering conventions

### 6.1 Code
- TypeScript `strict`, no `any` without a comment explaining why.
- **ESLint** (typescript-eslint, react, jsx-a11y, import order), **Prettier** for formatting. Both enforced in CI and in a pre-commit hook (lint-staged).
- Naming:
  - `camelCase` variables and functions
  - `PascalCase` components and types
  - `kebab-case` files
  - `snake_case` DB columns
- Domain logic lives in `packages/core`, pure and unit-tested. Apps stay thin.
- All external input (requests, LLM output, env vars) is validated with Zod at the boundary.
- Prompts are versioned files in `packages/ai/prompts`, never inline strings. A prompt change requires an eval run.
- ADRs (`docs/adr/NNN-*.md`) record significant decisions.

### 6.2 Git & CI
- Trunk-based: short-lived branches → PR → `main` (protected, CI must pass).
- Conventional Commits (`feat:`, `fix:`, `chore:`, …).
- CI (GitHub Actions) runs these checks:
  - install
  - lint
  - typecheck
  - unit tests (Vitest)
  - DB/integration tests (Postgres in Docker)
  - Playwright e2e for critical flows (login, daily set, teacher dashboard)
  - eval subset
  - build
  - secret scan (gitleaks)
  - dependency audit
- Renovate or Dependabot for dependency updates.
- Deploy: merge to `main` → Render auto-deploy to staging. Production deploys are promoted manually.

### 6.3 Design
- **Tailwind CSS + shadcn/ui.** Design tokens are CSS variables (color, radius, spacing, type scale) defined once in `packages/ui`.
- Mobile-first: students mostly use phones. Teacher dashboard is desktop-first.
- Font: Pretendard (SIL OFL) for Korean + Latin.
- Accessibility: WCAG 2.2 AA, keyboard navigable, contrast-checked tokens, `jsx-a11y` lint.
- Light mode first; dark mode tokens defined from day one so it's cheap to add later.
- Components: compose shadcn primitives; no one-off styling in pages. New UI patterns go into `packages/ui` with a short usage note.

## 7. Security & privacy

**Authentication and authorization**
- Better Auth with hashed passwords and httpOnly, secure, SameSite cookies.
- Login rate limiting and lockout.
- **Tenant isolation:** every query goes through a data-access layer scoped to the organization and the user's role. Automated tests prove that teacher A can't read hagwon B's data.
- Role-based access: admin / teacher / student, checked on the server for every action.

**Secrets and inputs**
- API keys live only in Render environment variables. They never reach the browser. gitleaks runs in CI.
- **LLM safety:**
  - Student writing is treated as untrusted input: delimited in the prompt, no tools given to the model, structured output only.
  - Per-user and per-organization rate limits and daily cost caps on LLM calls.
- Web hardening:
  - security headers (CSP, HSTS, frame-ancestors)
  - Zod validation on every input
  - parameterized SQL via Drizzle
  - CSRF protection on mutations

**Data**
- Neon point-in-time recovery; restore drill before the pilot.
- Audit log for admin and teacher actions on student data.

**Privacy — Korea PIPA**
- Minimal personal data: student display name + academy-issued login, no email or phone.
- Under-14 learners need legal-guardian consent. The hagwon collects it with our template.
- Privacy policy discloses overseas processing (Singapore hosting, LLM vendors).
- Data deletion on request; retention policy (e.g. delete a student's data 12 months after leaving).
- No voice data stored in the MVP (shadowing stays on-device).
- Legal review of the privacy policy before the pilot (one-off cost).

## 8. Roadmap

### Phase 0 — Foundations (≈ 1–2 weeks)
- Monorepo scaffold, lint/format/typecheck, CI pipeline, PR template, `CLAUDE.md` with conventions.
- Design tokens + base shadcn setup.
- Eval harness skeleton with first gold items.
- Infrastructure: Render (staging), Neon, R2, Sentry.
- Spike: Kokoro vs Piper voice quality and license check; pick one.
- **Exit:** empty app deploys to staging through green CI.

### Phase 1 — Core MVP (≈ 4–6 weeks)
- Auth, academies, classes, teacher-issued student accounts.
- Curriculum backbone data.
- Placement test.
- Nightly generation + QA + TTS pipeline.
- Daily set with MCQ, reading, listening and writing feedback.
- Skill estimates and student progress view.
- Teacher dashboard v1 with item flagging.
- **Exit:**
  - Evals E1–E7 pass at their bars.
  - The team can run a full week of daily sets end to end.

### Phase 2 — Pilot (≈ 6–8 weeks)
- Onboard 2–3 hagwons (100–300 students).
- Add shadowing, weekly printable reports and grade override.
- Collect teacher feedback weekly; grow the gold sets from flags.
- Measure the success criteria in §3.4. Interview owners about price.
- **Exit:** go / adjust / stop decision, and a pricing decision.

### Expansion (after pilot, ordered by expected value)

| # | Feature | Approach | Cost impact |
|---|---|---|---|
| X1 | **Billing** | Per-student monthly license; Toss Payments or invoices for hagwons | PG fees only |
| X2 | **Speaking feedback v1** | In-browser speech-to-text (Whisper via transformers.js / whisper.cpp WASM, or Moonshine; MIT) → word-level read-aloud accuracy + LLM feedback | $0 server |
| X3 | **Parent access** | Parent view of weekly report; KakaoTalk notification messages | Per-message fees |
| X4 | **Pronunciation scoring (premium)** | Self-hosted Wav2Vec2-based phoneme scoring on GPU once ≥ 2–3K students (or Azure for a small premium tier first); validate vs. human ratings | GPU ~$300–1,000/mo fixed |
| X5 | **Live AI conversation (premium)** | Realtime voice API (Gemini Live / OpenAI Realtime), capped minutes per plan | ~$1–4.5 / student / mo |
| X6 | **Native apps** | Wrap PWA (e.g. Capacitor) when push/mic needs require | Store fees |
| X7 | **New segments** | Adult niches (job interviews, nurses abroad), B2C, other countries | Marketing |

### Scale triggers

| Signal | Action |
|---|---|
| Web p95 latency or memory pressure | Render Starter → Standard; 2+ instances |
| > ~1,000 students | Render Pro workspace; Neon paid compute; Sentry Team |
| Hagwon requires in-Korea data storage | Move DB to Supabase / Postgres in Seoul region |
| ≥ 2–3K students using speaking features | Self-host STT/scoring on GPU |
| Render no longer fits | Same Docker image → Fly.io / AWS / GCP |

## 9. Cost plan (monthly estimates)

| Stage | Students | Infra | AI (LLM) | Total |
|---|---|---|---|---|
| Dev / demo | – | ~$0 | a few $ | ~$0–5 |
| Pilot (MVP) | 300 | ~$15–35 | ~$10–30 | **~$25–65** |
| Growth | 3,000 | ~$155–255 | ~$100–300 | **~$255–555** |
| + Speaking v1 (in-browser) | any | +$0 | – | unchanged |
| + Pronunciation premium | ≥ 2–3K | +$300–1,000 GPU | – | fixed |
| + Live conversation premium | per user | – | +$1–4.5 / user | per-use |

Not included: salaries, sales, legal review, domain (~$10–15/yr).

## 10. Risks & open questions

| Risk | Mitigation |
|---|---|
| AI content errors erode teacher trust | Evals + automatic QA + teacher flagging + fast fixes |
| Hagwons won't pay enough | Price interviews during pilot; keep cost per student low |
| Teacher adoption / workload | Dashboard must save time on day one; minimal setup |
| Minors' data / PIPA | Minimal data, no voice storage, consent template, legal review |
| Vendor price changes | Provider interfaces, Docker portability, monthly cost review |

**Questions to answer before Phase 0:**
1. Target age band: elementary, middle or high school? This changes content, UI tone and consent flow.
2. Korean UI from day one, or English-only for the first pilot?
3. Do you already have pilot hagwons lined up?
4. Product name / domain: keep "FluentLoop"?
