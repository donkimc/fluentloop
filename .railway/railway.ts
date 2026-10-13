// Railway project (docs/PLAN.md §2, docs/adr/002-railway.md). Preview with
// `railway config plan`, apply with `railway config apply`. Secrets are set
// in the Railway dashboard and referenced here with preserve() once they
// exist (Phase 1), never committed. The audio bucket is wired to the worker
// in Phase 1, when TTS uploads start.
import { bucket, defineRailway, github, postgres, project, service } from "railway/iac";

const REGION = "asia-southeast1-eqsg3a"; // Singapore

export default defineRailway(() => {
  const db = postgres("postgres", { region: REGION });
  const audio = bucket("audio", { region: "sin" });

  const web = service("web", {
    source: github("donkimc/fluentloop", { branch: "main" }),
    build: { builder: "DOCKERFILE", dockerfilePath: "apps/web/Dockerfile" },
    healthcheck: "/api/health",
    deploy: { region: REGION },
    env: {
      NODE_ENV: "production",
      DATABASE_URL: db.env.DATABASE_URL,
      // Secrets are set in the Railway dashboard (BETTER_AUTH_SECRET, BETTER_AUTH_URL,
      // KAKAO_*, RESEND_API_KEY). Wire them with preserve() once they exist.
    },
  });

  const nightly = service("nightly", {
    source: github("donkimc/fluentloop", { branch: "main" }),
    build: { builder: "DOCKERFILE", dockerfilePath: "apps/worker/Dockerfile" },
    deploy: {
      region: REGION,
      // 18:00 UTC = 03:00 KST: tomorrow's sets are ready before learners wake up.
      cronSchedule: "0 18 * * *",
      restartPolicyType: "NEVER",
    },
    env: {
      NODE_ENV: "production",
      DRY_RUN: "true",
      DATABASE_URL: db.env.DATABASE_URL,
    },
  });

  return project("fluentloop", { resources: [web, nightly, db, audio] });
});
