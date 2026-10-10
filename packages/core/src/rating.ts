/**
 * Elo-style skill rating.
 *
 * Learner and item share one scale (see levels.ts). After each answer the
 * learner's rating moves toward the observed result, faster while we are
 * still uncertain about them (few attempts) and slower once it settles.
 */

/** Rating difference at which the stronger side is expected to win ~91% of the time. */
const SCALE = 400;
const K_NEW = 40;
const K_SETTLED = 12;
const ATTEMPTS_TO_SETTLE = 30;

export function expectedScore(learnerRating: number, itemDifficulty: number): number {
  return 1 / (1 + 10 ** ((itemDifficulty - learnerRating) / SCALE));
}

export function kFactor(attempts: number): number {
  const progress = Math.min(Math.max(attempts, 0) / ATTEMPTS_TO_SETTLE, 1);
  return K_NEW + (K_SETTLED - K_NEW) * progress;
}

export interface RatingUpdate {
  rating: number;
  attempts: number;
}

/**
 * @param score 1 for correct, 0 for wrong; partial credit (e.g. writing rubric) in between.
 */
export function updateRating(
  current: RatingUpdate,
  itemDifficulty: number,
  score: number,
): RatingUpdate {
  if (score < 0 || score > 1 || Number.isNaN(score)) {
    throw new RangeError(`score must be between 0 and 1, got ${score}`);
  }
  const expected = expectedScore(current.rating, itemDifficulty);
  const rating = current.rating + kFactor(current.attempts) * (score - expected);
  return { rating, attempts: current.attempts + 1 };
}
