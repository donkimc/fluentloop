import { NextResponse } from "next/server";

import { loadPlacement, placementAnswerSchema, submitPlacementAnswer } from "@/lib/placement";
import { getSession } from "@/lib/session";

async function requireLearner(): Promise<{ userId: string } | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const consentedAt = (session.user as { consentedAt?: Date | string | null }).consentedAt;
  if (!consentedAt) {
    return NextResponse.json({ error: "Finish setup before the placement test." }, { status: 403 });
  }
  return { userId: session.user.id };
}

export async function GET() {
  const learner = await requireLearner();
  if (learner instanceof NextResponse) return learner;
  try {
    return NextResponse.json(await loadPlacement(learner.userId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load the placement test.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const learner = await requireLearner();
  if (learner instanceof NextResponse) return learner;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = placementAnswerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose an answer to continue." }, { status: 400 });
  }

  try {
    return NextResponse.json(await submitPlacementAnswer(learner.userId, parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save that answer.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
