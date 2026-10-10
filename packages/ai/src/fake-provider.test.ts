import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FakeProvider } from "./fake-provider";

const schema = z.object({ word: z.string() });

describe("FakeProvider", () => {
  it("returns the canned response parsed with the request schema", async () => {
    const provider = new FakeProvider({ "test@1": { word: "hello" } });
    const result = await provider.generateStructured({
      tier: "fast",
      promptId: "test@1",
      system: "",
      input: "",
      schema,
    });
    expect(result.data).toEqual({ word: "hello" });
  });

  it("rejects responses that do not match the schema", async () => {
    const provider = new FakeProvider({ "test@1": { word: 42 } });
    await expect(
      provider.generateStructured({
        tier: "fast",
        promptId: "test@1",
        system: "",
        input: "",
        schema,
      }),
    ).rejects.toThrow();
  });

  it("fails loudly on unknown prompt ids", async () => {
    const provider = new FakeProvider({});
    await expect(
      provider.generateStructured({
        tier: "fast",
        promptId: "missing@1",
        system: "",
        input: "",
        schema,
      }),
    ).rejects.toThrow(/missing@1/);
  });
});
