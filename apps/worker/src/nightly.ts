import { LEVEL_BANDS } from "@fluentloop/core";

import { loadEnv } from "./env";

/**
 * Nightly job entry point (Railway cron). Phase 1 fills in the steps:
 * generate sets per level band → QA checks → TTS → upload to the bucket → publish.
 */
const env = loadEnv();

console.info(
  JSON.stringify({
    job: "nightly",
    env: env.NODE_ENV,
    dryRun: env.DRY_RUN,
    levelBands: LEVEL_BANDS,
    status: "noop",
  }),
);
