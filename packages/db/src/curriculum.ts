import { sql } from "drizzle-orm";

import type { Database } from "./client";
import { curriculumNodes } from "./schema";

export interface CurriculumRow {
  id: string;
  level: string;
  skill: string;
  topic: string;
  title: string;
  korean: string;
  summary: string;
  headwords: readonly string[];
}

/** Replace the shared syllabus. Caller passes the core catalog. */
export async function replaceCurriculum(db: Database, rows: readonly CurriculumRow[]) {
  await db.delete(curriculumNodes);
  if (rows.length === 0) return;
  await db.insert(curriculumNodes).values(
    rows.map((row) => ({
      ...row,
      headwords: [...row.headwords],
    })),
  );
}

export async function countCurriculumNodes(db: Database): Promise<number> {
  const rows = await db.select({ value: sql<number>`count(*)::int` }).from(curriculumNodes);
  return rows[0]?.value ?? 0;
}
