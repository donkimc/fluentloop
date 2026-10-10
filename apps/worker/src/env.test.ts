import { describe, expect, it } from "vitest";

import { loadEnv } from "./env";

describe("loadEnv", () => {
  it("defaults to a development dry run", () => {
    expect(loadEnv({})).toEqual({ NODE_ENV: "development", DRY_RUN: true });
  });

  it("rejects invalid values", () => {
    expect(() => loadEnv({ DRY_RUN: "yes" })).toThrow();
  });
});
