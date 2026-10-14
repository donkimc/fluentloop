import { randomUUID } from "node:crypto";

import {
  answerPlacement,
  canRetakePlacement,
  currentPlacementItem,
  PLACEMENT_BANK,
  placementProgress,
  placementResults,
  placementStage,
  type PlacementState,
  type PublicPlacementItem,
  retakeAvailableAt,
  startPlacement,
} from "@fluentloop/core";
import {
  insertPlacementSession,
  latestPlacementSession,
  savePlacementSession,
  upsertSkillEstimate,
} from "@fluentloop/db";
import { z } from "zod";

import { getDb } from "./db";

const skillSchema = z.enum(["grammar", "vocabulary", "reading", "listening", "writing"]);

const ratingSchema = z.object({
  rating: z.number(),
  attempts: z.number().int().nonnegative(),
});

export const placementStateSchema = z.object({
  ratings: z.object({
    grammar: ratingSchema,
    vocabulary: ratingSchema,
    reading: ratingSchema,
    listening: ratingSchema,
    writing: ratingSchema,
  }),
  answers: z.array(
    z.object({
      itemId: z.string().min(1),
      skill: skillSchema,
      correct: z.boolean().nullable(),
    }),
  ),
  writing: z.string().nullable(),
});

export const placementAnswerSchema = z.object({
  itemId: z.string().min(1),
  choiceIndex: z.number().int().min(0).max(3).optional(),
  writing: z.string().max(2000).optional(),
});

export interface PlacementView {
  status: "in_progress" | "completed";
  progress: { done: number; total: number };
  item: PublicPlacementItem | null;
  results: { skill: string; band: string; sentence: string }[] | null;
  canRetake: boolean;
  retakeOn: string | null;
}

function parseState(value: unknown): PlacementState {
  return placementStateSchema.parse(value);
}

function viewFor(state: PlacementState, completedAt: Date | null, now: Date): PlacementView {
  const done = placementStage(state) === "done";
  const retakeOn = completedAt ? retakeAvailableAt(completedAt) : null;
  return {
    status: done ? "completed" : "in_progress",
    progress: placementProgress(state),
    item: done ? null : currentPlacementItem(state, PLACEMENT_BANK),
    results: done ? placementResults(state) : null,
    canRetake: done && canRetakePlacement(completedAt, now),
    retakeOn:
      done && retakeOn && !canRetakePlacement(completedAt, now)
        ? retakeOn.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "Asia/Seoul",
          })
        : null,
  };
}

export async function loadPlacement(userId: string, now = new Date()): Promise<PlacementView> {
  const db = getDb();
  const latest = await latestPlacementSession(db, userId);
  if (!latest) {
    const state = startPlacement();
    await insertPlacementSession(db, { id: randomUUID(), userId, state });
    return viewFor(state, null, now);
  }
  const state = parseState(latest.state);
  if (latest.status === "in_progress" && placementStage(state) !== "done") {
    return viewFor(state, null, now);
  }
  return viewFor(state, latest.completedAt ?? latest.startedAt, now);
}

export async function submitPlacementAnswer(
  userId: string,
  input: z.infer<typeof placementAnswerSchema>,
  now = new Date(),
): Promise<PlacementView> {
  const db = getDb();
  const latest = await latestPlacementSession(db, userId);
  if (!latest || latest.status !== "in_progress") {
    throw new Error("There is no placement test in progress.");
  }
  const state = parseState(latest.state);
  const next = answerPlacement(state, PLACEMENT_BANK, input);
  const done = placementStage(next) === "done";
  await savePlacementSession(db, {
    id: latest.id,
    userId,
    state: next,
    status: done ? "completed" : "in_progress",
    completedAt: done ? now : null,
  });
  if (done) {
    for (const result of placementResults(next)) {
      await upsertSkillEstimate(db, {
        userId,
        skill: result.skill,
        rating: next.ratings[result.skill].rating,
        attempts: next.ratings[result.skill].attempts,
      });
    }
  }
  return viewFor(next, done ? now : null, now);
}

export async function retakePlacement(userId: string, now = new Date()): Promise<PlacementView> {
  const db = getDb();
  const latest = await latestPlacementSession(db, userId);
  if (!latest || latest.status !== "completed") {
    throw new Error("Finish the current test before starting another.");
  }
  const completedAt = latest.completedAt ?? latest.startedAt;
  if (!canRetakePlacement(completedAt, now)) {
    throw new Error("You can retake the placement test once a month.");
  }
  const state = startPlacement();
  await insertPlacementSession(db, { id: randomUUID(), userId, state });
  return viewFor(state, null, now);
}
