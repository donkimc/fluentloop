import { describe, expect, it } from "vitest";

import { isKakaoConfigured, loadWebEnv } from "./env";

const base = {
  DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/fluentloop",
  BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
  BETTER_AUTH_URL: "http://localhost:3000",
};

describe("loadWebEnv", () => {
  it("accepts minimal auth config", () => {
    const env = loadWebEnv(base);
    expect(env.DATABASE_URL).toContain("postgresql://");
    expect(isKakaoConfigured(env)).toBe(false);
  });

  it("enables Kakao when both credentials exist", () => {
    const env = loadWebEnv({
      ...base,
      KAKAO_CLIENT_ID: "kakao-id",
      KAKAO_CLIENT_SECRET: "kakao-secret",
    });
    expect(isKakaoConfigured(env)).toBe(true);
  });

  it("rejects a short auth secret", () => {
    expect(() =>
      loadWebEnv({
        ...base,
        BETTER_AUTH_SECRET: "too-short",
      }),
    ).toThrow();
  });
});
