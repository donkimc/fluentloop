import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { schema } from "./schema";

export type Database = ReturnType<typeof createDb>;

/** Create a Drizzle client. Callers own the lifecycle (one per process is fine). */
export function createDb(connectionString: string) {
  const client = postgres(connectionString, { max: 10 });
  return drizzle(client, { schema });
}
