import { describe, expect, it } from "vitest";
import { normalizeForSearch } from "./text";

describe("normalizeForSearch", () => {
  it("remove acentos", () => {
    expect(normalizeForSearch("Uberlândia")).toBe("uberlandia");
    expect(normalizeForSearch("São Paulo")).toBe("sao paulo");
  });

  it("deixa tudo minúsculo", () => {
    expect(normalizeForSearch("PORTO ALEGRE")).toBe("porto alegre");
  });

  it("permite comparar uma busca sem acento com um valor acentuado", () => {
    expect(normalizeForSearch("uberlandia")).toBe(normalizeForSearch("Uberlândia"));
  });
});
