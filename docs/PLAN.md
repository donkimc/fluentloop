# FluentLoop — MVP & Expansion Plan (v2)

> Status: draft for review · No code written yet · "FluentLoop" is a working name (see §11).
> Every price in this document is an estimate from late-2026 research. Re-check vendor pricing pages before committing.
>
> **Hosting update (2026-10-12):** Render, Neon and Cloudflare R2 replaced by Railway for hosting, Postgres and file storage. See `docs/adr/002-railway.md`.
>
> **v2 changes:** the target moved from hagwons (B2B, minors, roles) to adult members of the founder's Karrot (당근) meetup group. That removes teacher/admin roles and parental consent. The UI is English, with Korean explanations for phrases and vocabulary.

## 1. Product summary

FluentLoop gives each learner a daily English set built for their current level. It starts from a short placement test and adapts every day from their results. All material is AI-generated, copyright-free and tracked over time.

**Test group:** the founder's Karrot meetup group: **~50 adults, mostly intermediate (≈ CEFR B1–B2), meeting once a week.**

- Real users from day one, reachable through the group chat.
- Feedback comes in person at meetups.

**Differentiator to test:** tie learning to the meetup.

- Each week the app prepares the phrases and vocabulary for that week's meetup topic.
- After the meetup, it reviews them.
- Generic AI-tutor apps (Speak, Praktika, Duolingo Max, ChatGPT Voice) don't have an offline community. This group does.

**Core loop:**

```
Placement test → skill profile (CEFR level per skill)
      ↓
Nightly: generate tomorrow's set (level-shared + personal review + this week's meetup topic) → automatic QA
      ↓
Learner does daily set (5–10 min): MCQ, reading, listening, writing, shadowing
      ↓
Answers → mistake log (grammar point, word) → updated skill profile
      ↓
Progress page + group streak       →  in-person meetup  →  (loop repeats)
```

## 2. Key decisions

| Area                  | Decision                                                                                                                                         | Reason                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Users                 | ~50 adults in one Karrot meetup group, invite-only                                                                                               | Real testers, fast feedback, no minors                             |
| Level range           | Focus on **B1–B2** (3 level bands: B1, B1+, B2), with A2 and C1 as edge bands                                                                    | Group is mid-level; fewer bands = cheaper generation and easier QA |
| Cadence               | Weekly cycle anchored on the meetup day                                                                                                          | Group meets once a week                                            |
| Roles                 | **None.** Every user is a learner                                                                                                                | Simplest possible app; owner tasks done via scripts or config      |
| UI language           | English                                                                                                                                          | Immersion                                                          |
| Korean support        | Korean meaning/explanation for phrases, vocabulary and grammar notes, behind a "show Korean" toggle                                              | Helps lower levels without breaking immersion                      |
| Login                 | Kakao Login (main) + email magic link (fallback), gated by a group invite code                                                                   | Every member has Kakao; no passwords to manage                     |
| Pronunciation scoring | Not in MVP                                                                                                                                       | Most expensive feature; add later                                  |
| Speech-to-text        | Not in MVP                                                                                                                                       | Later: in-browser Whisper/Moonshine (MIT), $0 server cost          |
| Speaking in MVP       | Shadowing (listen → record → compare, on-device only)                                                                                            | Zero cost, no voice data stored                                    |
| Text-to-speech        | Kokoro (Apache-2.0) or Piper (MIT code; check each voice's license)                                                                              | ~$0, generated nightly, cached                                     |
| LLM                   | Budget model for daily volume (e.g. Claude Haiku 5.5); stronger model (e.g. Claude Sonnet 5.5) for placement and QA, behind a provider interface | A few dollars a month at group size                                |
| Hosting               | Railway web service + Railway cron service (Singapore)                                                                                           | One provider, usage-billed, Docker-portable                        |
| Database              | Railway Postgres, same project and region as the app                                                                                             | Private network to the app; backups + PITR built in                |
| File storage          | Railway Bucket (S3-compatible, Singapore)                                                                                                        | Free egress for audio                                              |

## 3. MVP scope

### 3.1 Features (in build order)

1. **Join and login**
   - The member opens an invite link from the Karrot group chat.
   - Signs in with Kakao, or with an email magic link.
   - Picks a display name.
2. **Placement test**
   - About 15 minutes; adults won't sit through longer. Starts at B1 and adapts up or down, since the group is mid-level.
   - Adaptive MCQ for grammar and vocabulary, plus a short reading, a short listening and one writing prompt.
   - Output: an estimated CEFR level per skill, shown in plain words ("You're around B1 in grammar").
   - The learner can retake it once a month.
3. **Curriculum backbone**
   - Content concentrated on B1–B2 (bands B1, B1+, B2), with A2 and C1 edge bands for outliers. Split into skills: grammar, vocabulary, reading, listening, writing.
   - Built from a grammar-point list and openly licensed vocabulary lists (e.g. NGSL; verify the license).
   - Topics for adults: daily life, work, travel, small talk, opinions.
4. **Nightly generation** (Railway cron). For each level band (about 3–5), generate the next day's shared set:
   - 8–10 MCQ (grammar/vocabulary)
   - 1 short reading with questions
   - 1 listening clip with questions
   - 1 writing prompt with a sample answer
   - 3–5 shadowing sentences

   Then for each learner, add 3–5 review items from their mistake log.

   Every item gets Korean explanations, audio is generated with TTS and uploaded to the Railway bucket, and automatic QA (§5) runs before anything is published.

5. **Meetup topic pack (the differentiator)**
   - Weekly cycle anchored on the meetup day (set in config):
     - **Meetup day + 1:** the founder sets next week's topic in `config/meetup-topics.yaml` (or picks from an app-suggested list). There is no in-app admin.
     - **Days before the meetup:** the daily set includes the topic pack: 10 key phrases and vocabulary, a sample dialogue with audio, and 3 conversation questions to prepare.
     - **After the meetup:** a short review quiz on the pack, plus "phrases I wanted to say": the learner types what they couldn't express, and gets natural English for it.
   - **Founder review (~15 min/week):** spot-check the topic pack and a sample of Korean explanations before it goes live.
6. **Daily set (student view)**
   - Mobile-first PWA, 5–10 minutes.
   - MCQ is scored instantly.
   - **Writing feedback:** a rubric score, inline corrections and a better version of the learner's text, with a "show Korean" explanation.
7. **Vocabulary & phrase notebook**
   - Every word or phrase the learner misses or saves goes here: English, Korean meaning, example sentence and audio.
   - It feeds spaced-repetition review in the daily set.
8. **Shadowing:** play the sentence → record → play both back. The recording stays on the device and is never uploaded.
9. **Progress**
   - Streak, skill levels over time and recent mistakes.
   - **Group view**, the same for everyone:
     - group streak (how many members finished today)
     - opt-in weekly leaderboard by days completed, not by score
10. **Feedback button** on every item ("this is wrong / too hard / too easy") and in the app overall. Flags feed the evals.

### 3.2 Not in MVP

Pronunciation scoring, speech-to-text, live AI conversation, payments, native apps, multiple groups, admin/teacher roles, push notifications (the Karrot group chat serves as the reminder channel).

### 3.3 Success criteria (after a 6–8 week test)

| Metric                                                | Target                         |
| ----------------------------------------------------- | ------------------------------ |
| Members who sign up (of ~50)                          | ≥ 25                           |
| Week-4 retention (active ≥ 3 days in week 4)          | ≥ 8 people (≈ 30% of sign-ups) |
| Members who use the topic pack before a meetup        | ≥ 50% of active users          |
| Daily set completion on active days                   | ≥ 70%                          |
| Items flagged as wrong                                | < 2%                           |
| Members who'd pay, and how much (survey + interviews) | ≥ 5 say yes, with a ₩ amount   |
| AI + infra cost                                       | ≤ ₩30,000 / month total        |

## 4. Architecture

### 4.1 Stack

| Layer      | Choice                                                                  |
| ---------- | ----------------------------------------------------------------------- |
| Language   | TypeScript (strict)                                                     |
| Web app    | Next.js (App Router), installable PWA                                   |
| UI         | Tailwind CSS + shadcn/ui                                                |
| DB access  | Drizzle ORM + SQL migrations                                            |
| Auth       | Better Auth (Kakao social login + email magic link); invite-code gate   |
| Email      | Resend free tier (magic links)                                          |
| Validation | Zod: API, LLM structured outputs, forms, env vars                       |
| Jobs       | Railway cron service → `worker` app (same repo, own Docker image)       |
| TTS        | Kokoro (kokoro-js) or Piper CLI in the worker image (decide in a spike) |
| Storage    | Railway Bucket (S3-compatible)                                          |
| LLM        | Provider interface in `packages/ai`; Anthropic SDK first                |
| Monitoring | Sentry free tier, uptime pinger, structured logs                        |

There is no separate i18n framework for the MVP. UI strings are English. Korean appears only in generated learning content, as a field on each item.

### 4.2 Repository layout (monorepo, pnpm workspaces)

```
apps/
  web/        Next.js app (learner UI + API routes)
  worker/     nightly generation, QA, TTS, topic packs
packages/
  core/       curriculum, skill rating, spaced repetition, scheduling (pure, no I/O)
  db/         Drizzle schema, migrations, data access (always scoped to the current user)
  ai/         LLM provider interface, versioned prompts, output schemas
  evals/      gold sets, graders, runner
  ui/         design tokens and shared components
config/
  meetup-topics.yaml   weekly topic set by the owner
docs/         plan, ADRs, conventions
```

### 4.3 Core data model (first draft)

- `users` (display name, auth identities, CEFR estimates, settings such as Korean toggle and leaderboard opt-in)
- `invites` (code, uses, expiry)
- `curriculum_nodes` (level, skill, grammar point / vocabulary set)
- `items`: question bank. Stores:
  - type, content JSON, answer key
  - Korean explanation
  - level and tags
  - generation metadata (model, prompt version)
  - QA status, flag count
- `topic_packs` (week, topic, item references)
- `daily_sets`, `daily_set_items`
- `attempts`, `responses` (answer, correctness, AI feedback JSON, grader version)
- `mistakes` (user, skill, grammar point, word, item): drives review
- `notebook_entries` (user, phrase/word, Korean meaning, example, review schedule)
- `skill_estimates` (user × skill → rating, confidence, history)
- `feedback` (user, item, kind, comment)
- `assets` (bucket key, type, item)

### 4.4 Batch vs. live

- **Nightly:** all content generation, Korean explanations, QA and TTS. Uses the batch LLM API at a 50% discount.
- **Live:**
  - MCQ scoring: deterministic, no LLM.
  - Writing feedback: one small LLM call.
  - Notebook review: deterministic.

## 5. Evals (gate every prompt or model change)

| #   | Eval                               | Method                                                                            | Bar                                |
| --- | ---------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| E1  | Schema validity                    | Zod parse of every generated item                                                 | 100%                               |
| E2  | MCQ has exactly one correct answer | Independent model solves without the key; must match and find no 2nd valid option | ≥ 98%                              |
| E3  | Level fit (CEFR)                   | Vocabulary-list coverage + readability + LLM judge vs. level descriptors          | ≥ 90% within ±1 sub-level          |
| E4  | **Korean explanation accuracy**    | Translation/meaning check by a second model + founder spot-check sample           | ≥ 95%                              |
| E5  | Natural English                    | LLM judge: no unnatural or textbook-stiff phrases in dialogues and sample answers | ≥ 90%                              |
| E6  | Originality / copyright            | No long verbatim overlap, no lyrics or book passages, no trademarked exam names   | 0 violations                       |
| E7  | Safety & tone                      | No offensive, political or sensitive content in generated material                | 0 violations                       |
| E8  | Writing feedback quality           | AI score vs. human-scored gold set; corrections don't introduce errors            | QWK ≥ 0.7; ≥ 95% clean corrections |
| E9  | Placement sanity                   | Placement vs. learner self-assessment + retest consistency                        | ≥ 80% within ±1 level              |
| E10 | Cost & latency                     | $ per daily set; p95 writing feedback latency                                     | within budget                      |

- **Gold sets:** about 50–100 hand-checked items per type to start. Grow them from in-app flags during the test.
- **Production QA:** E1, E2, E4, E6 and E7 also run on every generated item before publishing. Failed items are regenerated or dropped.
- **CI:** a small eval subset runs on every PR; the full set runs nightly.

## 6. Engineering conventions

### 6.1 Code

- TypeScript `strict`; no `any` without a justifying comment.
- **ESLint** (typescript-eslint, react, jsx-a11y, import order) + **Prettier**, enforced in CI and in a pre-commit hook (lint-staged).
- Naming: `camelCase` values/functions, `PascalCase` components/types, `kebab-case` files, `snake_case` DB columns.
- Domain logic lives in `packages/core`: pure and unit-tested. Apps stay thin.
- Zod validation at every boundary: requests, LLM output, env vars, config files.
- Prompts are versioned files in `packages/ai/prompts`. A prompt change requires an eval run.
- Significant decisions are recorded as ADRs in `docs/adr/`.

### 6.2 Git & CI

- Trunk-based: short-lived branches → PR → protected `main`.
- Conventional Commits.
- GitHub Actions on every PR:
  - lint, typecheck
  - Vitest unit tests
  - integration tests (Postgres in Docker)
  - Playwright e2e for critical flows (join, placement, daily set, writing feedback)
  - eval subset
  - build
  - gitleaks secret scan
  - dependency audit
- Renovate or Dependabot for dependency updates.
- Merge to `main` deploys to staging; production deploys are promoted manually.

### 6.3 Design

- **Tailwind CSS + shadcn/ui.** Design tokens (color, radius, spacing, type scale) are CSS variables in `packages/ui`.
- Mobile-first: learners use phones on the go.
- Fonts: Inter or Pretendard (both OFL) so English and Korean text match.
- **Korean text styling:** visually secondary (smaller, muted color), always paired with the English it explains, toggleable.
- Accessibility: WCAG 2.2 AA, `jsx-a11y` lint, contrast-checked tokens.
- Light mode first; dark-mode tokens defined from day one.
- No one-off styling in pages. New patterns go into `packages/ui`.

## 7. Security & privacy

Adults only; no roles. That's simpler than v1, but the Korean privacy law (PIPA) still applies.

**Accounts and access**

- Better Auth sessions in httpOnly, secure cookies. No passwords: Kakao login or magic link only.
- Sign-up requires a valid invite code, so only group members can join.
- Every query is scoped to the signed-in user. Tests prove user A can't read user B's answers or writing. The group view shows only aggregates and opt-in display names.
- Owner tasks (topics, invites, data export) are CLI scripts run with server credentials. There is no admin UI to attack.

**Secrets and inputs**

- API keys live only in Railway environment variables. gitleaks runs in CI.
- **LLM safety:**
  - Learner writing is treated as untrusted input: delimited in the prompt, no tools, structured output only.
  - Per-user rate limits and daily cost caps on LLM calls.
- Web hardening: security headers (CSP, HSTS), CSRF protection, parameterized SQL via Drizzle.

**Data**

- Railway Postgres point-in-time recovery (about 4 weeks of history) plus daily volume backups. Enable both before the first learner signs up, and do one restore drill.
- Set a Railway usage limit so a runaway job can't run up the bill.

**Privacy (PIPA)**

- Collect the minimum: Kakao ID or email, display name, learning data. No phone number, no voice data.
- Consent screen at sign-up, covering:
  - what's collected and why
  - overseas processing (Singapore hosting, LLM vendors)
  - retention
- "Delete my account and data" button.
- Simple privacy policy and beta-tester terms ("free during test, data used to improve the app"). Get a cheap legal review before charging money.

## 8. Roadmap

### Phase 0 — Foundations (≈ 1–2 weeks)

- [x] Monorepo scaffold, lint/format/typecheck, CI, PR template, `CLAUDE.md` with conventions.
- [x] Design tokens + shadcn-style base components.
- [x] Eval harness with first gold items (deterministic checks; LLM-judged evals in Phase 1).
- [x] Dockerfiles for web and worker (both images build and run).
- [ ] Railway project from `.railway/railway.ts` (needs the founder's Railway account, Hobby plan). Replaces the earlier Render blueprint; see ADR 002.
- [ ] Sentry account; Kakao developer app registration (moved to Phase 1 with login and DB).
- [ ] Spike: Kokoro vs Piper voice quality and license check.
- [ ] Pick a name and register the domain.
- **Exit:** an empty app deploys to staging through green CI. (Kakao login moves to Phase 1.)

### Phase 1 — Core MVP (≈ 3–5 weeks)

- Invite-code join, Kakao/email login, consent.
- Placement test.
- Curriculum backbone.
- Nightly generation + QA + TTS.
- Daily set with writing feedback and Korean toggle.
- Notebook with spaced review.
- Progress page.
- Feedback button.
- **Exit:** E1–E8 pass, and the founder uses it daily for 1 week without blockers.

### Phase 2 — Group test (≈ 6–8 weeks)

- Invite the group in waves: 5 friendly testers first (week 1), then all ~50 members (week 2).
- Add meetup topic packs, shadowing, and the group streak / leaderboard.
- Weekly check-in at the meetup (5 minutes of feedback), plus a short survey every 2 weeks.
- Founder spends ~15 min/week checking the topic pack and Korean explanations.
- Grow the gold sets from flags; fix the top complaints weekly.
- **Exit:** measure §3.3 and decide go / adjust / stop. Run pricing interviews.

### Expansion (after the test, ordered by expected value)

| #   | Feature                                  | Approach                                                                                                                                                                 | Cost impact         |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| X1  | **Speaking feedback v1**                 | In-browser speech-to-text (Whisper via transformers.js / whisper.cpp WASM, or Moonshine; MIT) → read-aloud accuracy + LLM feedback on spoken answers to meetup questions | $0 server           |
| X2  | **Meetup conversation rehearsal**        | Text chat role-play on the week's topic first; voice later                                                                                                               | LLM only            |
| X3  | **Payments**                             | Monthly subscription (e.g. Toss Payments); free tier with limits                                                                                                         | PG fees             |
| X4  | **Multiple groups**                      | Any meetup organizer can create a group with its own topics. Introduces a single "organizer" role                                                                        | Small               |
| X5  | **Notifications**                        | Web push (PWA) first; KakaoTalk notification messages later                                                                                                              | Per-message fees    |
| X6  | **Pronunciation scoring (premium)**      | Self-hosted Wav2Vec2 phoneme scoring on GPU once ≥ 2–3K users (or Azure for a small premium tier first)                                                                  | GPU ~$300–1,000/mo  |
| X7  | **Live AI voice conversation (premium)** | Realtime voice API (Gemini Live / OpenAI Realtime), capped minutes                                                                                                       | ~$1–4.5 / user / mo |
| X8  | **Native apps**                          | Wrap PWA (e.g. Capacitor) when mic or push needs require                                                                                                                 | Store fees          |
| X9  | **Other segments**                       | Other Karrot/meetup groups → hagwon B2B (v1 plan) → other countries                                                                                                      | Marketing           |

### Scale triggers

| Signal                                 | Action                                                            |
| -------------------------------------- | ----------------------------------------------------------------- |
| Hobby plan's $5 included usage used up | Pay the usage delta; review the biggest service in the usage view |
| A second person needs project access   | Railway Pro ($20/month, includes $20 usage)                       |
| > ~1,000 users                         | Railway Pro; 2 web replicas; Sentry Team                          |
| ≥ 2–3K users on speaking features      | Self-host speech-to-text and scoring on GPU                       |
| Railway no longer fits                 | Same Docker images → Fly.io / AWS / GCP; `pg_dump` the database   |

## 9. Cost plan (monthly estimates)

| Stage                      | Users  | Infra                                                  | AI (LLM) | Total                   |
| -------------------------- | ------ | ------------------------------------------------------ | -------- | ----------------------- |
| Dev                        | 1–5    | ~$0–5 (Railway Free plan, or Hobby once staging is up) | < $1     | **~$0–6**               |
| Group test                 | ~50    | ~$6–12 (Railway Hobby $5 incl. $5 usage, plus overage) | ~$1–3    | **~$7–15 (≈ ₩10K–21K)** |
| Open to more groups        | ~1,000 | ~$40–80 (Railway Pro + usage)                          | ~$30–100 | **~$70–180**            |
| + Speaking v1 (in-browser) | any    | +$0                                                    | –        | unchanged               |

Not included: domain (~$10–15/year), legal review before charging, the founder's time.

## 10. Risks & open questions

| Risk                                             | Mitigation                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Small group → noisy metrics                      | Treat as qualitative discovery; interview members at meetups                              |
| Members drop off after novelty                   | 5–10 min sets; meetup tie-in as weekly reason to return; group streak                     |
| AI errors (esp. Korean explanations) erode trust | E2/E4 evals, QA before publishing, flag button, weekly fixes                              |
| B2C adult English is a red ocean                 | Differentiate on meetup/community-tied learning; keep hagwon B2B as later option          |
| Using Karrot name/brand                          | Don't use "Karrot/당근" in the product name or marketing; it's just where the group lives |
| Vendor price changes                             | Provider interfaces, Docker portability, monthly cost review                              |

**Answered:** ~50 members, mostly intermediate; weekly meetups; the founder will spend ~15 min/week checking content.

**Still open:**

1. Meetup weekday (sets the weekly cycle in config).
2. Name and domain (§11).

## 11. Name

Shortlist (all `.com` availability **unverified**, see below):

| Name               | Idea                                                            |
| ------------------ | --------------------------------------------------------------- |
| **FluentLoop**     | The daily adapt-and-repeat loop; already the repo name          |
| **Phrasebite**     | Bite-sized daily phrases; short, memorable                      |
| **Dongne English** | "Neighborhood English": local, community-first, fits the meetup |
| **MeetPrep**       | Prepare for this week's meetup; very literal                    |
| **Levelloop**      | Learning at your level, every day                               |

Check availability with a registrar search (Cloudflare Registrar, Namecheap, Porkbun) before deciding. The automated lookup from the build environment was blocked by network policy.
