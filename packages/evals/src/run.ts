import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { runChecks } from "./checks";

/**
 * Runs the deterministic checks over every gold item in ../gold.
 * Exits non-zero if any item fails, so CI blocks the change.
 */
const goldDir = fileURLToPath(new URL("../gold", import.meta.url));

let total = 0;
let failures = 0;

for (const file of readdirSync(goldDir).filter((f) => f.endsWith(".json"))) {
  const items: unknown[] = JSON.parse(readFileSync(join(goldDir, file), "utf8"));
  items.forEach((raw, index) => {
    total += 1;
    const failedChecks = runChecks(raw).filter((r) => !r.passed);
    if (failedChecks.length > 0) {
      failures += 1;
      for (const f of failedChecks) {
        console.error(`FAIL ${file}#${index} ${f.check}${f.detail ? `: ${f.detail}` : ""}`);
      }
    }
  });
}

console.info(`evals: ${total - failures}/${total} gold items passed`);
if (failures > 0 || total === 0) process.exit(1);
