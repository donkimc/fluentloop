import type { z } from "zod";

import type { LlmProvider, StructuredRequest, StructuredResult } from "./provider";

/**
 * Deterministic provider for tests and evals that must not spend money.
 * Responses are looked up by prompt id and still validated against the
 * request schema, exactly like a real provider's output would be.
 */
export class FakeProvider implements LlmProvider {
  constructor(private readonly responses: Record<string, unknown>) {}

  async generateStructured<T extends z.ZodType>(
    request: StructuredRequest<T>,
  ): Promise<StructuredResult<z.infer<T>>> {
    if (!(request.promptId in this.responses)) {
      throw new Error(`FakeProvider has no response for prompt "${request.promptId}"`);
    }
    const data = request.schema.parse(this.responses[request.promptId]);
    return { data, model: "fake", usage: { inputTokens: 0, outputTokens: 0 } };
  }
}
