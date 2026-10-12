# ADR 001 — Initial stack

- Status: accepted; hosting, database and storage superseded by ADR 002
- Date: 2026-10-10

## Context

Small team, ~50 test users, very low budget (~$10–20/month), and a need to
move hosting later without rewrites. See docs/PLAN.md §2 and §4.

## Decision

- **TypeScript monorepo** with pnpm workspaces: one language for UI, API,
  worker and evals.
- **Next.js (App Router)** web app, built as a standalone server in Docker.
- **Tailwind CSS v4 + shadcn-style components** in `packages/ui`, with design
  tokens as CSS variables.
- **Render** (Singapore): web service + cron job, both from Docker images,
  described in `render.yaml`.
- **Neon Postgres + Drizzle** (Phase 1), **Cloudflare R2** for audio (Phase 1).
- **LLM behind `LlmProvider`**: budget model for volume, stronger model for
  placement and QA; vendor chosen by eval results.
- **Tooling:** TypeScript 6.0 and ESLint 9. TypeScript 7 and ESLint 10 are
  out, but `typescript-eslint` and `eslint-plugin-jsx-a11y` don't support them
  yet. Upgrade when they do.

## Consequences

- Docker images keep us portable to Fly.io / AWS / GCP.
- Tailwind is imported by the app stylesheet, not by `packages/ui`: Turbopack
  can't resolve `tailwindcss` from inside a workspace package's CSS.
