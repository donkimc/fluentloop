import { findValidInvite, normalizeInviteCode } from "@fluentloop/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { loadWebEnv } from "@/lib/env";
import { INVITE_COOKIE, inviteCookieOptions } from "@/lib/invite-cookie";

const bodySchema = z.object({
  code: z.string().min(4).max(64),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid invite code." }, { status: 400 });
  }

  const code = normalizeInviteCode(parsed.data.code);
  const invite = await findValidInvite(getDb(), code);
  if (!invite) {
    return NextResponse.json(
      { error: "This invite code is invalid, expired, or used up." },
      { status: 403 },
    );
  }

  const env = loadWebEnv();
  const jar = await cookies();
  jar.set(INVITE_COOKIE, invite.code, inviteCookieOptions(env.NODE_ENV === "production"));

  return NextResponse.json({ ok: true, code: invite.code });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(INVITE_COOKIE);
  return NextResponse.json({ ok: true });
}
