import { describe, expect, it } from "vitest";

import { runChecks } from "./checks";

const validMcq = {
  type: "mcq",
  level: "B1",
  skill: "grammar",
  question: "I ___ here since 2020.",
  options: ["live", "have lived", "am living", "lived"],
  answerIndex: 1,
  explanation: { en: "Use present perfect with 'since'.", ko: "'since'와 함께 현재완료를 씁니다." },
};

function failed(raw: unknown): string[] {
  return runChecks(raw)
    .filter((r) => !r.passed)
    .map((r) => r.check);
}

describe("runChecks", () => {
  it("passes a valid item", () => {
    expect(failed(validMcq)).toEqual([]);
  });

  it("stops at the schema check when the item is malformed", () => {
    expect(failed({ ...validMcq, options: ["a", "b"] })).toEqual(["E1 schema"]);
  });

  it("flags duplicate options", () => {
    expect(failed({ ...validMcq, options: ["live", "Live ", "lived", "living"] })).toEqual([
      "E2 distinct options",
    ]);
  });

  it("flags a Korean field without Korean", () => {
    expect(failed({ ...validMcq, explanation: { en: "x", ko: "present perfect" } })).toEqual([
      "E4 Korean present",
    ]);
  });

  it("flags trademarked exam names as whole words only", () => {
    expect(failed({ ...validMcq, question: "Practice for the TOEIC: I ___ here." })).toEqual([
      "E6 banned terms",
    ]);
    expect(failed({ ...validMcq, question: "Toeicish is not a word: I ___ here." })).toEqual([]);
  });
});
