import { NextResponse } from "next/server";

import { retakePlacement } from "@/lib/placement";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const consentedAt = (session.user as { consentedAt?: Date | string | null }).consentedAt;
  if (!consentedAt) {
    return NextResponse.json({ error: "Finish setup before the placement test." }, { status: 403 });
  }

  try {
    return NextResponse.json(await retakePlacement(session.user.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start a new test.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
