import { StatusKind } from "@/components/ui/StatusBadge";
import { getIntegratorTheme, IntegratorTheme } from "@/lib/integrator-theme";

export interface DailyGenerationPoint {
  /** Rótulo curto do eixo X, ex: dia do mês. */
  day: string;
  kwh: number;
  condition: "sunny" | "cloudy";
}

export interface ClientPortalData {
  slug: string;
  clientName: string;
  city: string;
  plant: string;
  status: StatusKind;
  todayGenerationKwh: number;
  changeVsAverage: string;
  accumulatedSavingsBRL: number;
  co2AvoidedKg: number;
  dailyGeneration: DailyGenerationPoint[];
  integrator: IntegratorTheme;
}

type PortalSeed = Omit<ClientPortalData, "integrator"> & { integratorSlug: string };

const mockPortalSeeds: PortalSeed[] = [
  {
    slug: "marcos-andrade",
    clientName: "Marcos Andrade",
    city: "Porto Alegre, RS",
    plant: "Residência Jardim Europa",
    status: "online",
    todayGenerationKwh: 892,
    changeVsAverage: "+12% vs. média",
    accumulatedSavingsBRL: 7820,
    co2AvoidedKg: 628,
    integratorSlug: "energia-solar-rs",
    dailyGeneration: [
      { day: "05", kwh: 720, condition: "sunny" },
      { day: "06", kwh: 690, condition: "sunny" },
      { day: "07", kwh: 410, condition: "cloudy" },
      { day: "08", kwh: 760, condition: "sunny" },
      { day: "09", kwh: 805, condition: "sunny" },
      { day: "10", kwh: 380, condition: "cloudy" },
      { day: "11", kwh: 640, condition: "sunny" },
      { day: "12", kwh: 830, condition: "sunny" },
      { day: "13", kwh: 790, condition: "sunny" },
      { day: "14", kwh: 450, condition: "cloudy" },
      { day: "15", kwh: 770, condition: "sunny" },
      { day: "16", kwh: 810, condition: "sunny" },
      { day: "17", kwh: 860, condition: "sunny" },
      { day: "18", kwh: 892, condition: "sunny" },
    ],
  },
  {
    slug: "fazenda-boa-vista",
    clientName: "Fazenda Boa Vista",
    city: "Santa Maria, RS",
    plant: "Sítio Boa Vista",
    status: "online",
    todayGenerationKwh: 3120,
    changeVsAverage: "+5% vs. média",
    accumulatedSavingsBRL: 24_450,
    co2AvoidedKg: 2140,
    integratorSlug: "energia-solar-rs",
    dailyGeneration: [
      { day: "05", kwh: 2680, condition: "sunny" },
      { day: "06", kwh: 2590, condition: "sunny" },
      { day: "07", kwh: 1980, condition: "cloudy" },
      { day: "08", kwh: 2750, condition: "sunny" },
      { day: "09", kwh: 2890, condition: "sunny" },
      { day: "10", kwh: 2020, condition: "cloudy" },
      { day: "11", kwh: 2610, condition: "sunny" },
      { day: "12", kwh: 2940, condition: "sunny" },
      { day: "13", kwh: 2870, condition: "sunny" },
      { day: "14", kwh: 2150, condition: "cloudy" },
      { day: "15", kwh: 2780, condition: "sunny" },
      { day: "16", kwh: 2960, condition: "sunny" },
      { day: "17", kwh: 3050, condition: "sunny" },
      { day: "18", kwh: 3120, condition: "sunny" },
    ],
  },
  {
    slug: "loja-ferreira-materiais",
    clientName: "Loja Ferreira Materiais",
    city: "Caxias do Sul, RS",
    plant: "Galpão Comercial",
    status: "alert",
    todayGenerationKwh: 410,
    changeVsAverage: "-38% vs. média",
    accumulatedSavingsBRL: 3960,
    co2AvoidedKg: 302,
    integratorSlug: "sol-nordeste",
    dailyGeneration: [
      { day: "05", kwh: 640, condition: "sunny" },
      { day: "06", kwh: 610, condition: "sunny" },
      { day: "07", kwh: 590, condition: "sunny" },
      { day: "08", kwh: 300, condition: "cloudy" },
      { day: "09", kwh: 650, condition: "sunny" },
      { day: "10", kwh: 670, condition: "sunny" },
      { day: "11", kwh: 640, condition: "sunny" },
      { day: "12", kwh: 250, condition: "cloudy" },
      { day: "13", kwh: 600, condition: "sunny" },
      { day: "14", kwh: 590, condition: "sunny" },
      { day: "15", kwh: 480, condition: "sunny" },
      { day: "16", kwh: 430, condition: "sunny" },
      { day: "17", kwh: 420, condition: "sunny" },
      { day: "18", kwh: 410, condition: "sunny" },
    ],
  },
];

export function getPortalData(slug: string): ClientPortalData | undefined {
  const seed = mockPortalSeeds.find((item) => item.slug === slug);
  if (!seed) return undefined;

  const integrator = getIntegratorTheme(seed.integratorSlug);
  if (!integrator) return undefined;

  return {
    slug: seed.slug,
    clientName: seed.clientName,
    city: seed.city,
    plant: seed.plant,
    status: seed.status,
    todayGenerationKwh: seed.todayGenerationKwh,
    changeVsAverage: seed.changeVsAverage,
    accumulatedSavingsBRL: seed.accumulatedSavingsBRL,
    co2AvoidedKg: seed.co2AvoidedKg,
    dailyGeneration: seed.dailyGeneration,
    integrator,
  };
}
