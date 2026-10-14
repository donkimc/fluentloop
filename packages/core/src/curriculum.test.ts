import { describe, expect, it } from "vitest";

import {
  CORE_BANDS,
  CURRICULUM,
  curriculumNodes,
  isCoreBand,
  nodesForDailySet,
  TOPICS,
} from "./curriculum";
import { LEVEL_BANDS, SKILLS } from "./levels";

describe("curriculum backbone", () => {
  it("uses unique ids", () => {
    const ids = CURRICULUM.map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every band and skill", () => {
    for (const level of LEVEL_BANDS) {
      for (const skill of SKILLS) {
        expect(curriculumNodes({ level, skill }).length).toBeGreaterThan(0);
      }
    }
  });

  it("gives every core band a node for each topic and practice skill", () => {
    for (const level of CORE_BANDS) {
      expect(isCoreBand(level)).toBe(true);
      for (const topic of TOPICS) {
        for (const skill of ["vocabulary", "reading", "listening", "writing"] as const) {
          expect(curriculumNodes({ level, skill, topic })).toHaveLength(1);
        }
      }
      expect(curriculumNodes({ level, skill: "grammar" }).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps headwords on vocabulary nodes only", () => {
    for (const node of CURRICULUM) {
      if (node.skill === "vocabulary") {
        expect(node.headwords.length).toBeGreaterThanOrEqual(6);
      } else {
        expect(node.headwords).toEqual([]);
      }
    }
  });

  it("builds a daily set from the band's grammar plus one topic", () => {
    const nodes = nodesForDailySet("B1", "travel");
    const skills = new Set(nodes.map((node) => node.skill));
    expect([...skills]).toEqual(["grammar", "vocabulary", "reading", "listening", "writing"]);
    expect(nodes.filter((node) => node.skill === "vocabulary").map((node) => node.topic)).toEqual([
      "travel",
    ]);
    expect(
      nodes.filter((node) => node.skill === "grammar").every((node) => node.level === "B1"),
    ).toBe(true);
  });

  it("treats A2 and C1 as edge bands", () => {
    expect(isCoreBand("A2")).toBe(false);
    expect(isCoreBand("C1")).toBe(false);
    expect(nodesForDailySet("A2", "work").some((node) => node.skill === "writing")).toBe(true);
  });
});
