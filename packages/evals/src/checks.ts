import { type Item, itemSchema } from "@fluentloop/ai";

/**
 * Deterministic checks that run on every generated item, in CI and in the
 * nightly pipeline before an item is published. Ids match docs/PLAN.md §5.
 */

export interface CheckResult {
  check: string;
  passed: boolean;
  detail?: string;
}

const HANGUL = /[가-힣]/;

/**
 * E6: trademarked exam names must not appear in generated content.
 * Matched as whole words, case-insensitive.
 */
const BANNED_TERMS = ["IELTS", "TOEIC", "TOEFL", "OPIc"];

function textOf(item: Item): string[] {
  switch (item.type) {
    case "mcq":
      return [item.question, ...item.options, item.explanation.en];
    case "vocab":
      return [item.term, item.meaning.en, item.example];
  }
}

function koreanOf(item: Item): string {
  return item.type === "mcq" ? item.explanation.ko : item.meaning.ko;
}

/** E1: the raw value parses as an item. Returns the parsed item for the remaining checks. */
export function checkSchema(raw: unknown): { result: CheckResult; item?: Item } {
  const parsed = itemSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      result: { check: "E1 schema", passed: false, detail: parsed.error.issues[0]?.message },
    };
  }
  return { result: { check: "E1 schema", passed: true }, item: parsed.data };
}

/**
 * E2 (structural part): options are distinct, so the answer key can only
 * point at one of them. The "exactly one correct answer" judgement itself
 * needs an independent model and is added in Phase 1.
 */
export function checkMcqStructure(item: Item): CheckResult | undefined {
  if (item.type !== "mcq") return undefined;
  const normalized = item.options.map((o) => o.trim().toLowerCase());
  const distinct = new Set(normalized).size === normalized.length;
  return {
    check: "E2 distinct options",
    passed: distinct,
    detail: distinct ? undefined : "duplicate options",
  };
}

/** E4 (structural part): the Korean explanation is actually written in Korean. */
export function checkKorean(item: Item): CheckResult {
  const passed = HANGUL.test(koreanOf(item));
  return {
    check: "E4 Korean present",
    passed,
    detail: passed ? undefined : "no Hangul in Korean field",
  };
}

export function checkBannedTerms(item: Item): CheckResult {
  const text = textOf(item).join("\n");
  const found = BANNED_TERMS.filter((term) => new RegExp(`\\b${term}\\b`, "i").test(text));
  return {
    check: "E6 banned terms",
    passed: found.length === 0,
    detail: found.length ? `found: ${found.join(", ")}` : undefined,
  };
}

export function runChecks(raw: unknown): CheckResult[] {
  const { result, item } = checkSchema(raw);
  if (!item) return [result];
  return [result, checkMcqStructure(item), checkKorean(item), checkBannedTerms(item)].filter(
    (r): r is CheckResult => r !== undefined,
  );
}
