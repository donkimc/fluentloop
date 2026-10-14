import { and, desc, eq } from "drizzle-orm";

import type { Database } from "./client";
import { placementSessions, skillEstimates } from "./schema";

export type PlacementStatus = "in_progress" | "completed";

export async function latestPlacementSession(db: Database, userId: string) {
  const rows = await db
    .select()
    .from(placementSessions)
    .where(eq(placementSessions.userId, userId))
    .orderBy(desc(placementSessions.startedAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertPlacementSession(
  db: Database,
  input: { id: string; userId: string; state: unknown },
) {
  await db.insert(placementSessions).values({
    id: input.id,
    userId: input.userId,
    status: "in_progress",
    state: input.state,
  });
}

export async function savePlacementSession(
  db: Database,
  input: {
    id: string;
    userId: string;
    state: unknown;
    status: PlacementStatus;
    completedAt: Date | null;
  },
) {
  await db
    .update(placementSessions)
    .set({
      state: input.state,
      status: input.status,
      completedAt: input.completedAt,
    })
    .where(and(eq(placementSessions.id, input.id), eq(placementSessions.userId, input.userId)));
}

export async function upsertSkillEstimate(
  db: Database,
  input: { userId: string; skill: string; rating: number; attempts: number },
) {
  await db
    .insert(skillEstimates)
    .values({
      userId: input.userId,
      skill: input.skill,
      rating: input.rating,
      attempts: input.attempts,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [skillEstimates.userId, skillEstimates.skill],
      set: {
        rating: input.rating,
        attempts: input.attempts,
        updatedAt: new Date(),
      },
    });
}
