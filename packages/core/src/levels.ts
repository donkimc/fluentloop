/**
 * Level bands used for content generation.
 *
 * The test group is mostly intermediate, so content is concentrated on
 * B1–B2 (three bands) with one edge band on each side for outliers.
 */
export const LEVEL_BANDS = ["A2", "B1", "B1+", "B2", "C1"] as const;

export type LevelBand = (typeof LEVEL_BANDS)[number];

export const SKILLS = ["grammar", "vocabulary", "reading", "listening", "writing"] as const;

export type Skill = (typeof SKILLS)[number];

/**
 * Rating scale: each band spans 100 rating points, starting at 1000 for A2.
 * A learner rated 1150 sits in the middle of B1.
 */
const BAND_WIDTH = 100;
const FIRST_BAND_FLOOR = 1000;

export function bandForRating(rating: number): LevelBand {
  const index = Math.floor((rating - FIRST_BAND_FLOOR) / BAND_WIDTH);
  const clamped = Math.min(Math.max(index, 0), LEVEL_BANDS.length - 1);
  return LEVEL_BANDS[clamped] as LevelBand;
}

/** Rating at the centre of a band, used as the starting point and as item difficulty. */
export function ratingForBand(band: LevelBand): number {
  return FIRST_BAND_FLOOR + LEVEL_BANDS.indexOf(band) * BAND_WIDTH + BAND_WIDTH / 2;
}
