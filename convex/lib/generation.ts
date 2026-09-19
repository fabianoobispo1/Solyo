/**
 * Geração/economia/CO2 são MOCK, derivados de `capacityKwp` — não há
 * telemetria de inversor neste MVP (ver `readings`/`tariffs` em
 * convex/schema.ts, propositalmente sem uso). Os números são
 * deterministicamente "aleatórios" por usina (hash do `plantIdSeed`), então
 * a mesma usina sempre mostra os mesmos valores entre chamadas, mas dois
 * dias diferentes do mês real produzem totais diferentes.
 */

const PEAK_SUN_HOURS = 5.0; // média de horas de sol pico em MG
const SYSTEM_EFFICIENCY = 0.8; // perdas típicas de inversor/cabo/sujeira
const TARIFF_BRL_PER_KWH = 0.98; // tarifa residencial média usada no cálculo
const CO2_KG_PER_KWH = 0.084; // fator de emissão evitado por kWh

export interface DailyGenerationPoint {
  day: string;
  kwh: number;
  condition: "sunny" | "cloudy";
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pseudoRandom(seed: string): number {
  return (hashSeed(seed) % 1000) / 1000;
}

function isCloudyDay(plantIdSeed: string, dayOffset: number): boolean {
  return pseudoRandom(`${plantIdSeed}:cloudy:${dayOffset}`) < 0.22;
}

export function estimateDailyKwh(capacityKwp: number, plantIdSeed: string, dayOffset: number): number {
  const base = capacityKwp * PEAK_SUN_HOURS * SYSTEM_EFFICIENCY;
  const variance = 0.85 + pseudoRandom(`${plantIdSeed}:kwh:${dayOffset}`) * 0.3;
  const cloudyFactor = isCloudyDay(plantIdSeed, dayOffset) ? 0.55 : 1;
  return Math.max(1, Math.round(base * variance * cloudyFactor));
}

/** Série dos últimos `days` dias, terminando hoje (último item = hoje). */
export function buildDailyGeneration(
  capacityKwp: number,
  plantIdSeed: string,
  days = 14
): DailyGenerationPoint[] {
  const points: DailyGenerationPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOffset = days - 1 - i;

    points.push({
      day: String(date.getDate()).padStart(2, "0"),
      kwh: estimateDailyKwh(capacityKwp, plantIdSeed, dayOffset),
      condition: isCloudyDay(plantIdSeed, dayOffset) ? "cloudy" : "sunny",
    });
  }

  return points;
}

/** Soma estimada do mês corrente, do dia 1 até hoje. */
export function estimateMonthToDateKwh(capacityKwp: number, plantIdSeed: string): number {
  const dayOfMonth = new Date().getDate();
  let total = 0;
  for (let dayOffset = 0; dayOffset < dayOfMonth; dayOffset += 1) {
    total += estimateDailyKwh(capacityKwp, plantIdSeed, dayOffset);
  }
  return total;
}

export function estimateSavingsBRL(kwh: number): number {
  return Math.round(kwh * TARIFF_BRL_PER_KWH);
}

export function estimateCo2AvoidedKg(kwh: number): number {
  return Math.round(kwh * CO2_KG_PER_KWH);
}

/** Texto pronto pro pill "+12% vs. média" do portal do cliente. */
export function formatChangeVsAverage(series: DailyGenerationPoint[]): string {
  if (series.length < 2) return "sem histórico suficiente";
  const today = series[series.length - 1].kwh;
  const previous = series.slice(0, -1);
  const average = previous.reduce((sum, point) => sum + point.kwh, 0) / previous.length;
  if (average === 0) return "sem histórico suficiente";
  const changePct = Math.round(((today - average) / average) * 100);
  const sign = changePct >= 0 ? "+" : "";
  return `${sign}${changePct}% vs. média`;
}
