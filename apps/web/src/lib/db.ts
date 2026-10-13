import { createDb, type Database } from "@fluentloop/db";

import { loadWebEnv } from "./env";

const globalForDb = globalThis as typeof globalThis & { __fluentloopDb?: Database };

export function getDb(): Database {
  if (!globalForDb.__fluentloopDb) {
    globalForDb.__fluentloopDb = createDb(loadWebEnv().DATABASE_URL);
  }
  return globalForDb.__fluentloopDb;
}
