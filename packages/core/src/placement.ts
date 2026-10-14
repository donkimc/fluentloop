import {
  bandForRating,
  LEVEL_BANDS,
  type LevelBand,
  ratingForBand,
  type Skill,
  SKILLS,
} from "./levels";
import type { PlacementBank, PlacementMcq, PlacementPrompt } from "./placement-bank";
import { updateRating } from "./rating";

/**
 * Placement test. Adults start at B1 and the next question moves one band
 * up or down. About thirteen steps: grammar, vocabulary, one reading, one
 * listening clip, and one writing sample. A finished test can be retaken
 * after 30 days.
 *
 * Writing is scored only by length here. The real writing grader arrives
 * with daily-set feedback.
 */

export const PLACEMENT_PLAN = {
  grammar: 4,
  vocabulary: 4,
  reading: 2,
  listening: 2,
} as const;

export const PLACEMENT_LENGTH =
  PLACEMENT_PLAN.grammar +
  PLACEMENT_PLAN.vocabulary +
  PLACEMENT_PLAN.reading +
  PLACEMENT_PLAN.listening +
  1;

export const RETAKE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

const SCORED_SKILLS = ["grammar", "vocabulary", "reading", "listening"] as const;

export interface SkillRating {
  rating: number;
  attempts: number;
}

export interface PlacementAnswer {
  itemId: string;
  skill: Skill;
  /** Null for the writing sample. */
  correct: boolean | null;
}

export interface PlacementState {
  ratings: Record<Skill, SkillRating>;
  answers: PlacementAnswer[];
  writing: string | null;
}

export type PlacementStage = (typeof SCORED_SKILLS)[number] | "writing" | "done";

export interface PublicPlacementItem {
  id: string;
  skill: Skill;
  prompt: string;
  koreanHint: string;
  options?: readonly string[];
  passage?: string;
  /** Text for the device voice. The page does not show it unless audio is unavailable. */
  listenText?: string;
}

export interface PlacementResult {
  skill: Skill;
  band: LevelBand;
  sentence: string;
}

function freshRating(): SkillRating {
  return { rating: ratingForBand("B1"), attempts: 0 };
}

export function startPlacement(): PlacementState {
  return {
    ratings: {
      grammar: freshRating(),
      vocabulary: freshRating(),
      reading: freshRating(),
      listening: freshRating(),
      writing: freshRating(),
    },
    answers: [],
    writing: null,
  };
}

function answersFor(state: PlacementState, skill: Skill): PlacementAnswer[] {
  return state.answers.filter((answer) => answer.skill === skill);
}

export function placementStage(state: PlacementState): PlacementStage {
  for (const skill of SCORED_SKILLS) {
    if (answersFor(state, skill).length < PLACEMENT_PLAN[skill]) return skill;
  }
  if (state.writing === null) return "writing";
  return "done";
}

export function placementProgress(state: PlacementState): { done: number; total: number } {
  const writingDone = state.writing === null ? 0 : 1;
  return { done: state.answers.length + writingDone, total: PLACEMENT_LENGTH };
}

function clampIndex(index: number): number {
  return Math.min(Math.max(index, 0), LEVEL_BANDS.length - 1);
}

function priorBand(state: PlacementState, skills: readonly Skill[]): LevelBand {
  const rating =
    skills.reduce((sum, skill) => sum + state.ratings[skill].rating, 0) / skills.length;
  return bandForRating(rating);
}

/** Band of the next question. Grammar and vocabulary start at B1 and step one band per answer. */
export function targetBand(state: PlacementState, skill: Skill): LevelBand {
  let index: number;
  if (skill === "grammar" || skill === "vocabulary") {
    index = LEVEL_BANDS.indexOf("B1");
  } else if (skill === "reading" || skill === "listening") {
    index = LEVEL_BANDS.indexOf(priorBand(state, ["grammar", "vocabulary"]));
  } else {
    index = LEVEL_BANDS.indexOf(
      priorBand(state, ["grammar", "vocabulary", "reading", "listening"]),
    );
  }
  for (const answer of answersFor(state, skill)) {
    if (answer.correct === null) continue;
    index = clampIndex(index + (answer.correct ? 1 : -1));
  }
  return LEVEL_BANDS[index] as LevelBand;
}

function unused(state: PlacementState, items: readonly PlacementMcq[]): PlacementMcq[] {
  const seen = new Set(state.answers.map((answer) => answer.itemId));
  return items.filter((item) => !seen.has(item.id));
}

function nearest(items: readonly PlacementMcq[], band: LevelBand): PlacementMcq | undefined {
  const start = LEVEL_BANDS.indexOf(band);
  for (let distance = 0; distance < LEVEL_BANDS.length; distance += 1) {
    for (const index of [start - distance, start + distance]) {
      if (index < 0 || index >= LEVEL_BANDS.length) continue;
      const found = items.find((item) => item.level === LEVEL_BANDS[index]);
      if (found) return found;
    }
  }
  return undefined;
}

function currentMcq(state: PlacementState, bank: PlacementBank, skill: Skill): PlacementMcq {
  const stageItems = bank.mcq.filter((item) => item.skill === skill);
  const remaining = unused(state, stageItems);
  const previous = answersFor(state, skill).at(-1);
  if (previous && (skill === "reading" || skill === "listening")) {
    const priorItem = stageItems.find((item) => item.id === previous.itemId);
    const sibling = remaining.find((item) => item.groupId === priorItem?.groupId);
    if (sibling) return sibling;
  }
  const picked = nearest(remaining, targetBand(state, skill));
  if (!picked) {
    throw new Error(`No ${skill} placement item left.`);
  }
  return picked;
}

function currentWriting(state: PlacementState, bank: PlacementBank): PlacementPrompt {
  const band = targetBand(state, "writing");
  const start = LEVEL_BANDS.indexOf(band);
  for (let distance = 0; distance < LEVEL_BANDS.length; distance += 1) {
    for (const index of [start - distance, start + distance]) {
      if (index < 0 || index >= LEVEL_BANDS.length) continue;
      const prompt = bank.writing.find((item) => item.level === LEVEL_BANDS[index]);
      if (prompt) return prompt;
    }
  }
  throw new Error("No writing placement prompt.");
}

function toPublicMcq(item: PlacementMcq): PublicPlacementItem {
  return {
    id: item.id,
    skill: item.skill,
    prompt: item.prompt,
    koreanHint: item.koreanHint,
    options: item.options,
    ...(item.passage ? { passage: item.passage } : {}),
    ...(item.listenText ? { listenText: item.listenText } : {}),
  };
}

export function currentPlacementItem(
  state: PlacementState,
  bank: PlacementBank,
): PublicPlacementItem | null {
  const stage = placementStage(state);
  if (stage === "done") return null;
  if (stage === "writing") {
    const prompt = currentWriting(state, bank);
    return {
      id: prompt.id,
      skill: "writing",
      prompt: prompt.prompt,
      koreanHint: prompt.koreanHint,
    };
  }
  return toPublicMcq(currentMcq(state, bank, stage));
}

function writingScore(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words >= 40) return 0.85;
  if (words >= 15) return 0.6;
  return 0.35;
}

export function answerPlacement(
  state: PlacementState,
  bank: PlacementBank,
  input: { itemId: string; choiceIndex?: number; writing?: string },
): PlacementState {
  const stage = placementStage(state);
  if (stage === "done") {
    throw new Error("This placement test is already finished.");
  }
  if (stage === "writing") {
    const prompt = currentWriting(state, bank);
    if (input.itemId !== prompt.id) throw new Error("That question is not the current one.");
    const writing = input.writing?.trim() ?? "";
    if (!writing) throw new Error("Write a short answer before continuing.");
    if (writing.length > 2000) throw new Error("Keep the answer under 2000 characters.");
    const rating = updateRating(
      state.ratings.writing,
      ratingForBand(prompt.level),
      writingScore(writing),
    );
    return {
      ...state,
      writing,
      ratings: { ...state.ratings, writing: rating },
    };
  }

  const item = currentMcq(state, bank, stage);
  if (input.itemId !== item.id) throw new Error("That question is not the current one.");
  if (input.choiceIndex === undefined || input.choiceIndex < 0 || input.choiceIndex > 3) {
    throw new Error("Choose one option.");
  }
  const correct = input.choiceIndex === item.answerIndex;
  const rating = updateRating(state.ratings[stage], ratingForBand(item.level), correct ? 1 : 0);
  return {
    ...state,
    ratings: { ...state.ratings, [stage]: rating },
    answers: [...state.answers, { itemId: item.id, skill: stage, correct }],
  };
}

const SKILL_NAME: Record<Skill, string> = {
  grammar: "grammar",
  vocabulary: "vocabulary",
  reading: "reading",
  listening: "listening",
  writing: "writing",
};

export function placementResults(state: PlacementState): PlacementResult[] {
  if (placementStage(state) !== "done") {
    throw new Error("Results are available after the test is finished.");
  }
  return SKILLS.map((skill) => {
    const band = bandForRating(state.ratings[skill].rating);
    return {
      skill,
      band,
      sentence: `You're around ${band} in ${SKILL_NAME[skill]}.`,
    };
  });
}

export function canRetakePlacement(completedAt: Date | null, now: Date): boolean {
  if (!completedAt) return true;
  return now.getTime() - completedAt.getTime() >= RETAKE_AFTER_MS;
}

export function retakeAvailableAt(completedAt: Date): Date {
  return new Date(completedAt.getTime() + RETAKE_AFTER_MS);
}
