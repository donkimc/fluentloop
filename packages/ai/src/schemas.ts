import { LEVEL_BANDS, SKILLS } from "@fluentloop/core";
import { z } from "zod";

/**
 * Schemas for generated learning content. Every item the LLM produces is
 * parsed with these before it is stored (eval E1), so they are the contract
 * between prompts and the rest of the app.
 */

/** English text paired with a Korean explanation shown behind the "show Korean" toggle. */
export const bilingualSchema = z.object({
  en: z.string().min(1),
  ko: z.string().min(1),
});

const itemBaseSchema = z.object({
  level: z.enum(LEVEL_BANDS),
  skill: z.enum(SKILLS),
  tags: z.array(z.string().min(1)).default([]),
});

export const mcqItemSchema = itemBaseSchema.extend({
  type: z.literal("mcq"),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: bilingualSchema,
});

export const vocabItemSchema = itemBaseSchema.extend({
  type: z.literal("vocab"),
  term: z.string().min(1),
  meaning: bilingualSchema,
  example: z.string().min(1),
});

export const itemSchema = z.discriminatedUnion("type", [mcqItemSchema, vocabItemSchema]);

export type BilingualText = z.infer<typeof bilingualSchema>;
export type McqItem = z.infer<typeof mcqItemSchema>;
export type VocabItem = z.infer<typeof vocabItemSchema>;
export type Item = z.infer<typeof itemSchema>;
