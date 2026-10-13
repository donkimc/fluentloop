import { randomBytes } from "node:crypto";

import { z } from "zod";

import { createDb } from "./client";
import { normalizeInviteCode } from "./invites";
import { invites } from "./schema";

const argsSchema = z.object({
  code: z.string().min(4).max(64).optional(),
  maxUses: z.coerce.number().int().positive().default(50),
  expiresInDays: z.coerce.number().int().positive().optional(),
});

function parseArgs(argv: string[]) {
  const raw: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token?.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      raw[key] = "true";
    } else {
      raw[key] = value;
      i += 1;
    }
  }
  return argsSchema.parse({
    code: raw.code,
    maxUses: raw["max-uses"] ?? raw.maxUses,
    expiresInDays: raw["expires-in-days"] ?? raw.expiresInDays,
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const options = parseArgs(process.argv.slice(2));
  const code = normalizeInviteCode(options.code ?? `MEETUP-${randomBytes(3).toString("hex")}`);
  const expiresAt =
    options.expiresInDays === undefined
      ? null
      : new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000);

  const db = createDb(databaseUrl);
  await db.insert(invites).values({
    id: randomBytes(16).toString("hex"),
    code,
    maxUses: options.maxUses,
    expiresAt,
  });

  console.info(
    JSON.stringify(
      {
        code,
        maxUses: options.maxUses,
        expiresAt: expiresAt?.toISOString() ?? null,
        joinPath: `/join?code=${encodeURIComponent(code)}`,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
