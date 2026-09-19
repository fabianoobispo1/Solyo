import { describe, expect, it } from "vitest";
import {
  buildDailyGeneration,
  estimateCo2AvoidedKg,
  estimateDailyKwh,
  estimateMonthToDateKwh,
  estimateSavingsBRL,
  formatChangeVsAverage,
} from "./generation";

describe("estimateDailyKwh", () => {
  it("é determinístico para a mesma usina e o mesmo dia", () => {
    const a = estimateDailyKwh(5.4, "plant_1", 3);
    const b = estimateDailyKwh(5.4, "plant_1", 3);
    expect(a).toBe(b);
  });

  it("usinas maiores (mais kWp) geram mais, em média, que usinas menores", () => {
    const small = estimateDailyKwh(3, "plant_small", 0);
    const large = estimateDailyKwh(30, "plant_large", 0);
    expect(large).toBeGreaterThan(small);
  });

  it("nunca devolve zero ou negativo, mesmo em dia nublado", () => {
    for (let day = 0; day < 30; day += 1) {
      expect(estimateDailyKwh(1, "plant_edge", day)).toBeGreaterThan(0);
    }
  });
});

describe("buildDailyGeneration", () => {
  it("devolve o número de dias pedido", () => {
    expect(buildDailyGeneration(5.4, "plant_1", 14)).toHaveLength(14);
    expect(buildDailyGeneration(5.4, "plant_1", 7)).toHaveLength(7);
  });

  it("o último ponto da série é sempre hoje", () => {
    const today = new Date();
    const series = buildDailyGeneration(5.4, "plant_1", 5);
    const last = series[series.length - 1];
    expect(last.day).toBe(String(today.getDate()).padStart(2, "0"));
  });

  it("cada ponto tem kwh > 0 e condition válida", () => {
    const series = buildDailyGeneration(9.8, "plant_2", 14);
    for (const point of series) {
      expect(point.kwh).toBeGreaterThan(0);
      expect(["sunny", "cloudy"]).toContain(point.condition);
    }
  });
});

describe("estimateMonthToDateKwh", () => {
  it("cresce com a capacidade instalada", () => {
    const small = estimateMonthToDateKwh(3, "plant_a");
    const large = estimateMonthToDateKwh(20, "plant_a");
    expect(large).toBeGreaterThan(small);
  });

  it("é determinístico para a mesma usina", () => {
    expect(estimateMonthToDateKwh(5.4, "plant_x")).toBe(estimateMonthToDateKwh(5.4, "plant_x"));
  });
});

describe("estimateSavingsBRL / estimateCo2AvoidedKg", () => {
  it("crescem junto com o kWh informado", () => {
    expect(estimateSavingsBRL(1000)).toBeGreaterThan(estimateSavingsBRL(100));
    expect(estimateCo2AvoidedKg(1000)).toBeGreaterThan(estimateCo2AvoidedKg(100));
  });

  it("zero kWh gera zero economia/CO2", () => {
    expect(estimateSavingsBRL(0)).toBe(0);
    expect(estimateCo2AvoidedKg(0)).toBe(0);
  });
});

describe("formatChangeVsAverage", () => {
  it("marca alta com sinal de +", () => {
    const series = [
      { day: "01", kwh: 100, condition: "sunny" as const },
      { day: "02", kwh: 100, condition: "sunny" as const },
      { day: "03", kwh: 200, condition: "sunny" as const },
    ];
    expect(formatChangeVsAverage(series)).toBe("+100% vs. média");
  });

  it("marca queda sem sinal de +", () => {
    const series = [
      { day: "01", kwh: 200, condition: "sunny" as const },
      { day: "02", kwh: 200, condition: "sunny" as const },
      { day: "03", kwh: 100, condition: "cloudy" as const },
    ];
    expect(formatChangeVsAverage(series)).toBe("-50% vs. média");
  });

  it("avisa quando não há histórico suficiente", () => {
    expect(formatChangeVsAverage([{ day: "01", kwh: 100, condition: "sunny" }])).toBe(
      "sem histórico suficiente"
    );
  });
});
