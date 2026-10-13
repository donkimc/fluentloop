import { describe, expect, it } from "vitest";

import { isInviteRedeemable, normalizeInviteCode } from "./invites";

describe("normalizeInviteCode", () => {
  it("trims and uppercases", () => {
    expect(normalizeInviteCode("  meetup-ab12  ")).toBe("MEETUP-AB12");
  });
});

describe("isInviteRedeemable", () => {
  const now = new Date("2026-10-12T00:00:00.000Z");

  it("accepts an unused, unexpired invite", () => {
    expect(
      isInviteRedeemable({ maxUses: 50, useCount: 0, expiresAt: new Date("2026-12-01") }, now),
    ).toBe(true);
  });

  it("rejects when uses are exhausted", () => {
    expect(isInviteRedeemable({ maxUses: 1, useCount: 1, expiresAt: null }, now)).toBe(false);
  });

  it("rejects when expired", () => {
    expect(
      isInviteRedeemable({ maxUses: 10, useCount: 0, expiresAt: new Date("2026-10-11") }, now),
    ).toBe(false);
  });

  it("accepts null expiry", () => {
    expect(isInviteRedeemable({ maxUses: 10, useCount: 9, expiresAt: null }, now)).toBe(true);
  });
});
