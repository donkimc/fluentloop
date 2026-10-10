# Prompts

Versioned prompt files live here, one file per prompt version
(e.g. `daily-mcq@1.md`). Rules:

- Never edit a released version in place. Copy it to `@2` and change the copy.
- Every generated item stores the prompt id that produced it.
- A new prompt version must pass the evals (`pnpm evals`) before it is used.

The first prompts are added in Phase 1.
