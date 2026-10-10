import { describe, expect, it } from "vitest";

import { expectedScore, kFactor, updateRating } from "./rating";

describe("expectedScore", () => {
  it("is 0.5 when learner and item are matched", () => {
    expect(expectedScore(1200, 1200)).toBeCloseTo(0.5);
  });

  it("is higher for easier items", () => {
    expect(expectedScore(1200, 1000)).toBeGreaterThan(expectedScore(1200, 1400));
  });
});

describe("kFactor", () => {
  it("starts high and settles after enough attempts", () => {
    expect(kFactor(0)).toBe(40);
    expect(kFactor(30)).toBe(12);
    expect(kFactor(500)).toBe(12);
  });
});

describe("updateRating", () => {
  const start = { rating: 1200, attempts: 0 };

  it("raises the rating after a correct answer and lowers it after a wrong one", () => {
    expect(updateRating(start, 1200, 1).rating).toBeGreaterThan(1200);
    expect(updateRating(start, 1200, 0).rating).toBeLessThan(1200);
  });

  it("moves less once the learner has settled", () => {
    const fresh = updateRating(start, 1200, 1).rating - 1200;
    const settled = updateRating({ rating: 1200, attempts: 100 }, 1200, 1).rating - 1200;
    expect(settled).toBeLessThan(fresh);
  });

  it("counts the attempt", () => {
    expect(updateRating(start, 1200, 1).attempts).toBe(1);
  });

  it("rejects scores outside 0..1", () => {
    expect(() => updateRating(start, 1200, 1.5)).toThrow(RangeError);
    expect(() => updateRating(start, 1200, Number.NaN)).toThrow(RangeError);
  });
});
