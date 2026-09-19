import { describe, expect, it } from "vitest";
import {
  applySoiling,
  applySoilingToSeries,
  buildDailyGeneration,
  estimateCo2AvoidedKg,
  estimateDailyKwh,
  estimateMonthToDateKwh,
  estimateSavingsBRL,
  formatChangeVsAverage,
  soilingFactor,
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

describe("soilingFactor", () => {
  const params = { lossPerDayPct: 1, maxLossPct: 20 };
  const now = new Date("2026-01-31T00:00:00Z").getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  it("sem data de limpeza registrada, não penaliza (fator 1)", () => {
    expect(soilingFactor(undefined, params, now)).toBe(1);
  });

  it("limpeza feita agora mesmo não perde geração", () => {
    expect(soilingFactor(now, params, now)).toBe(1);
  });

  it("perde proporcionalmente aos dias desde a última limpeza", () => {
    const fiveDaysAgo = now - 5 * oneDay;
    expect(soilingFactor(fiveDaysAgo, params, now)).toBeCloseTo(0.95, 5);
  });

  it("nunca passa do teto configurado (maxLossPct)", () => {
    const oneYearAgo = now - 365 * oneDay;
    expect(soilingFactor(oneYearAgo, params, now)).toBeCloseTo(0.8, 5);
  });

  it("data de limpeza no futuro não gera fator > 1", () => {
    const tomorrow = now + oneDay;
    expect(soilingFactor(tomorrow, params, now)).toBe(1);
  });
});

describe("applySoiling / applySoilingToSeries", () => {
  it("fator 1 não altera o valor", () => {
    expect(applySoiling(1000, 1)).toBe(1000);
  });

  it("reduz o kWh proporcionalmente ao fator", () => {
    expect(applySoiling(1000, 0.9)).toBe(900);
  });

  it("nunca aplica um kWh negativo", () => {
    expect(applySoiling(10, 0)).toBe(0);
  });

  it("aplica o fator a cada ponto da série, sem zerar nenhum dia", () => {
    const series = [
      { day: "01", kwh: 100, condition: "sunny" as const },
      { day: "02", kwh: 10, condition: "cloudy" as const },
    ];
    const result = applySoilingToSeries(series, 0.9);
    expect(result[0].kwh).toBe(90);
    expect(result[1].kwh).toBe(9);
  });

  it("fator 1 devolve a mesma série (sem cópia desnecessária)", () => {
    const series = [{ day: "01", kwh: 100, condition: "sunny" as const }];
    expect(applySoilingToSeries(series, 1)).toBe(series);
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
