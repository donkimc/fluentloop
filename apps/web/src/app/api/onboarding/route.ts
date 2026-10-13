import { user } from "@fluentloop/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(40, "Display name must be at most 40 characters."),
  consent: z.boolean().refine((value) => value, {
    message: "Consent is required to continue.",
  }),
  showKorean: z.boolean().default(true),
  leaderboardOptIn: z.boolean().default(false),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { displayName, showKorean, leaderboardOptIn } = parsed.data;
  await getDb()
    .update(user)
    .set({
      displayName,
      showKorean,
      leaderboardOptIn,
      consentedAt: new Date(),
      name: displayName,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));

  return NextResponse.json({ ok: true });
}
