import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("junta strings simples com espaço", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignora valores falsy (false, null, undefined, '')", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("achata arrays aninhados", () => {
    expect(cn("a", ["b", ["c", false, "d"]])).toBe("a b c d");
  });

  it("aplica condicionais no estilo `cond && 'classe'`", () => {
    const active = true;
    const disabled = false;
    expect(cn("base", active && "active", disabled && "disabled")).toBe("base active");
  });

  it("devolve string vazia sem argumentos ou só falsy", () => {
    expect(cn()).toBe("");
    expect(cn(false, null, undefined)).toBe("");
  });
});
