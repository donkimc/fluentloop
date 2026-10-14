import { z } from "zod";

/**
 * Worker configuration, validated at startup so a misconfigured cron run
 * fails immediately instead of halfway through generation.
 * Phase 1 adds the LLM, database and bucket variables.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DRY_RUN: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

export type WorkerEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): WorkerEnv {
  return envSchema.parse(source);
}
