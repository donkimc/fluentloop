# FluentLoop — working conventions

Daily English sets at each learner's level, tested first with an adult Karrot
meetup group (~50 people, mostly B1–B2). Product plan: `docs/PLAN.md`.
Decisions: `docs/adr/`.

## Commands

| Command                                    | What it does                                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                             | Install everything (pnpm workspaces)                                                                                                      |
| `pnpm dev`                                 | Run the web app at http://localhost:3000                                                                                                  |
| `pnpm check`                               | Lint + format check + typecheck + unit tests + evals. Run before every PR                                                                 |
| `pnpm build`                               | Production build of the web app                                                                                                           |
| `pnpm test:e2e`                            | Playwright smoke tests against the production build (run `pnpm build` first). Set `PLAYWRIGHT_CHROMIUM_PATH` to use an installed Chromium |
| `pnpm evals`                               | Deterministic checks over gold content items                                                                                              |
| `pnpm --filter @fluentloop/worker nightly` | Run the nightly job locally (dry run by default)                                                                                          |

## Layout

```
apps/web        Next.js app (learner UI + API routes)
apps/worker     nightly job: generate → QA → TTS → publish
packages/core   pure domain logic (levels, rating, scheduling) — no I/O
packages/ai     LLM provider interface, content schemas, versioned prompts
packages/evals  content checks, gold sets, eval runner
packages/ui     design tokens (styles.css) and shared components
```

## Code rules

- TypeScript strict. No `any` without a comment saying why.
- Naming: `camelCase` values/functions, `PascalCase` components/types,
  `kebab-case` file names, `snake_case` database columns.
- Business logic goes in `packages/core` as pure functions with unit tests.
  Apps stay thin: they wire I/O to core logic.
- Validate every boundary with Zod: request bodies, LLM output, env vars,
  config files. Never trust LLM output until it has been parsed.
- Every LLM call goes through `LlmProvider` (`packages/ai`). Never import a
  vendor SDK from an app directly.
- Prompts are versioned files in `packages/ai/prompts` (`name@N.md`). Never edit
  a released version; add `@N+1`. Prompt or model changes need an eval run.
- Learner writing is untrusted input: delimit it in prompts, give the model no
  tools, require structured output.
- Tests sit next to the code: `foo.ts` → `foo.test.ts` (Vitest).
- Imports are sorted by ESLint (`simple-import-sort`); type-only imports use `import type`.

## UI rules

- Tailwind + the tokens in `packages/ui/src/styles.css`. Use semantic classes
  (`bg-primary`, `text-muted-foreground`, `text-korean`), never raw colors.
- Reusable patterns go in `packages/ui`; no one-off styling in pages.
- Mobile-first: every learner screen must work at 360px wide.
- English is the interface language. Korean appears only as helper text via
  `<KoreanHint>`, always below the English it explains.
- Accessibility: WCAG 2.2 AA. Real buttons and links, labels on inputs,
  visible focus. `jsx-a11y` lint must pass.

## Git

- Branch from `main`, open a PR, CI must be green. `main` is protected.
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- Never commit `.env` files, API keys, or real learner data.

## Security & privacy (summary of PLAN.md §7)

- Secrets only in Render environment variables.
- Every database query is scoped to the signed-in user.
- Collect the minimum personal data; no voice recordings leave the device.
