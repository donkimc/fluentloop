import { describe, expect, it } from "vitest";

import { bandForRating, LEVEL_BANDS, ratingForBand } from "./levels";

describe("level bands", () => {
  it("round-trips every band through its centre rating", () => {
    for (const band of LEVEL_BANDS) {
      expect(bandForRating(ratingForBand(band))).toBe(band);
    }
  });

  it("clamps ratings outside the scale to the edge bands", () => {
    expect(bandForRating(0)).toBe("A2");
    expect(bandForRating(5000)).toBe("C1");
  });

  it("places band boundaries on the lower band's floor", () => {
    expect(bandForRating(1099.9)).toBe("A2");
    expect(bandForRating(1100)).toBe("B1");
  });
});
