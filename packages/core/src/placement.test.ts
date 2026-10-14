import { describe, expect, it } from "vitest";

import {
  answerPlacement,
  canRetakePlacement,
  currentPlacementItem,
  PLACEMENT_LENGTH,
  placementProgress,
  placementResults,
  placementStage,
  retakeAvailableAt,
  startPlacement,
  targetBand,
} from "./placement";
import { PLACEMENT_BANK } from "./placement-bank";

const bank = PLACEMENT_BANK;

function answerKey(itemId: string): number {
  const item = bank.mcq.find((entry) => entry.id === itemId);
  if (!item) throw new Error(`missing ${itemId}`);
  return item.answerIndex;
}

describe("placement", () => {
  it("starts at a B1 grammar question and hides the answer key", () => {
    const item = currentPlacementItem(startPlacement(), bank);
    expect(item?.skill).toBe("grammar");
    expect(item?.id).toBe("g-b1-1");
    expect(item).not.toHaveProperty("answerIndex");
    expect(placementStage(startPlacement())).toBe("grammar");
  });

  it("steps up after a correct answer and down after a wrong one", () => {
    const start = startPlacement();
    const up = answerPlacement(start, bank, { itemId: "g-b1-1", choiceIndex: answerKey("g-b1-1") });
    expect(targetBand(up, "grammar")).toBe("B1+");
    expect(currentPlacementItem(up, bank)?.id).toBe("g-b1p-1");

    const down = answerPlacement(start, bank, { itemId: "g-b1-1", choiceIndex: 3 });
    expect(targetBand(down, "grammar")).toBe("A2");
    expect(currentPlacementItem(down, bank)?.id).toBe("g-a2-1");
  });

  it("keeps both reading questions on the same passage", () => {
    let state = startPlacement();
    while (placementStage(state) === "grammar" || placementStage(state) === "vocabulary") {
      const item = currentPlacementItem(state, bank);
      if (!item) throw new Error("expected a question");
      state = answerPlacement(state, bank, { itemId: item.id, choiceIndex: answerKey(item.id) });
    }
    const first = currentPlacementItem(state, bank);
    if (!first) throw new Error("expected a reading question");
    expect(first.skill).toBe("reading");
    expect(first.passage).toBeTruthy();
    state = answerPlacement(state, bank, { itemId: first.id, choiceIndex: answerKey(first.id) });
    const second = currentPlacementItem(state, bank);
    expect(second?.passage).toBe(first?.passage);
    expect(second?.id).not.toBe(first?.id);
  });

  it("finishes every skill and refuses a late answer", () => {
    let state = startPlacement();
    while (placementStage(state) !== "writing") {
      const item = currentPlacementItem(state, bank);
      if (!item) throw new Error("expected a question");
      state = answerPlacement(state, bank, { itemId: item.id, choiceIndex: 0 });
    }
    const writing = currentPlacementItem(state, bank);
    if (!writing) throw new Error("expected a writing prompt");
    expect(writing.skill).toBe("writing");
    state = answerPlacement(state, bank, {
      itemId: writing.id,
      writing: "I usually wake up, make coffee, and check my messages before I leave for work.",
    });
    expect(placementStage(state)).toBe("done");
    expect(placementProgress(state)).toEqual({ done: PLACEMENT_LENGTH, total: PLACEMENT_LENGTH });
    expect(placementResults(state).map((result) => result.skill)).toEqual([
      "grammar",
      "vocabulary",
      "reading",
      "listening",
      "writing",
    ]);
    expect(placementResults(state)[0]?.sentence).toMatch(/^You're around .+ in grammar\.$/);
    expect(() => answerPlacement(state, bank, { itemId: "g-b1-1", choiceIndex: 0 })).toThrow(
      /finished/,
    );
  });

  it("rejects an answer for a question that is not current", () => {
    expect(() =>
      answerPlacement(startPlacement(), bank, { itemId: "g-a2-1", choiceIndex: 0 }),
    ).toThrow(/not the current/);
  });

  it("allows a retake 30 days after the previous test", () => {
    const finished = new Date("2026-10-01T00:00:00.000Z");
    const tooSoon = new Date("2026-10-30T00:00:00.000Z");
    const ready = new Date("2026-10-31T00:00:00.000Z");
    expect(canRetakePlacement(null, ready)).toBe(true);
    expect(canRetakePlacement(finished, tooSoon)).toBe(false);
    expect(canRetakePlacement(finished, ready)).toBe(true);
    expect(retakeAvailableAt(finished).toISOString()).toBe("2026-10-31T00:00:00.000Z");
  });
});
