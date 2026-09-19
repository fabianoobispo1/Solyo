import { describe, expect, it } from "vitest";
import { getAvatarGradient, getInitials } from "./avatar";

describe("getInitials", () => {
  it("pega a primeira letra do primeiro e do último nome", () => {
    expect(getInitials("Marcos Andrade")).toBe("MA");
  });

  it("usa só a primeira letra quando há um único nome", () => {
    expect(getInitials("Aurora")).toBe("A");
  });

  it("ignora espaços extras entre palavras", () => {
    expect(getInitials("  Marcos   Andrade  ")).toBe("MA");
  });

  it("usa primeiro e último de nomes compostos, ignorando os do meio", () => {
    expect(getInitials("Carlos Eduardo Lima")).toBe("CL");
  });

  it("devolve string vazia para entrada vazia", () => {
    expect(getInitials("")).toBe("");
  });
});

describe("getAvatarGradient", () => {
  it("é determinístico: a mesma seed sempre devolve o mesmo gradiente", () => {
    const first = getAvatarGradient("Marcos Andrade");
    const second = getAvatarGradient("Marcos Andrade");
    expect(first).toBe(second);
  });

  it("devolve uma das classes do estilo `from-* to-*`", () => {
    expect(getAvatarGradient("Fazenda Boa Vista")).toMatch(/^from-\S+ to-\S+$/);
  });

  it("seeds diferentes tendem a produzir gradientes diferentes", () => {
    const names = ["Marcos Andrade", "Fazenda Boa Vista", "Loja Ferreira", "Condomínio Vista Verde"];
    const gradients = new Set(names.map(getAvatarGradient));
    expect(gradients.size).toBeGreaterThan(1);
  });
});
