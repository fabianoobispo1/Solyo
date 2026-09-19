import { StatusKind } from "@/components/ui/StatusBadge";

export interface Client {
  id: string;
  /** Quando presente, habilita o link "Ver portal" para /portal/[slug]. Ver docs/dashboard-integrador.md. */
  slug?: string;
  name: string;
  plant: string;
  city: string;
  kwp: number;
  generationKwh: number;
  status: StatusKind;
  alert?: string;
  /** Epoch ms. Registrada pelo cliente no próprio portal — null se nunca registrada. */
  lastCleaningAt?: number | null;
}

export const mockClients: Client[] = [
  {
    id: "cl_01",
    slug: "marcos-andrade",
    name: "Marcos Andrade",
    plant: "Residência Jardim Europa",
    city: "Porto Alegre, RS",
    kwp: 5.4,
    generationKwh: 892,
    status: "online",
  },
  {
    id: "cl_02",
    slug: "fazenda-boa-vista",
    name: "Fazenda Boa Vista",
    plant: "Sítio Boa Vista",
    city: "Santa Maria, RS",
    kwp: 18.2,
    generationKwh: 3120,
    status: "online",
  },
  {
    id: "cl_03",
    slug: "loja-ferreira-materiais",
    name: "Loja Ferreira Materiais",
    plant: "Galpão Comercial",
    city: "Caxias do Sul, RS",
    kwp: 12.8,
    generationKwh: 410,
    status: "alert",
    alert: "Geração 38% abaixo do esperado nos últimos 3 dias",
  },
  {
    id: "cl_04",
    name: "Condomínio Vista Verde",
    plant: "Área comum — bloco B",
    city: "Gramado, RS",
    kwp: 24.5,
    generationKwh: 4980,
    status: "online",
  },
  {
    id: "cl_05",
    name: "Clínica Odontológica Sorriso",
    plant: "Unidade Centro",
    city: "Pelotas, RS",
    kwp: 8.1,
    generationKwh: 0,
    status: "offline",
    alert: "Inversor sem comunicação há 2 dias",
  },
];

export interface DashboardKpis {
  activeClients: number;
  totalGenerationKwh: number;
  monthlySavingsBRL: number;
  openAlerts: number;
}

export const mockDashboardKpis: DashboardKpis = {
  activeClients: 248,
  totalGenerationKwh: 128_430,
  monthlySavingsBRL: 96_200,
  openAlerts: mockClients.filter((client) => client.status === "alert" || client.status === "offline")
    .length,
};

export const mockIntegratorUser = {
  name: "Ana Ferreira",
  role: "Integrador Pro",
};
