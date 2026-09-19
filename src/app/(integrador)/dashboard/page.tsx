"use client";

import { KPICard } from "@/components/ui/KPICard";
import { ClientsPanel } from "@/components/dashboard/ClientsPanel";
import { useKpis } from "@/lib/data/useKpis";

export default function DashboardPage() {
  const kpis = useKpis();
  const isLoading = kpis === undefined;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <KPICard
          variant="filled"
          label="Geração total (mês)"
          value={isLoading ? "—" : `${kpis.totalGenerationKwh.toLocaleString("pt-BR")} kWh`}
          sub="mês corrente até hoje"
        />
        <KPICard
          label="Clientes ativos"
          value={isLoading ? "—" : kpis.activeClients.toString()}
        />
        <KPICard
          label="Economia gerada"
          value={isLoading ? "—" : `R$ ${(kpis.monthlySavingsBRL / 1000).toFixed(1)}k`}
          sub="acumulado no mês"
        />
        <KPICard
          label="Alertas ativos"
          value={isLoading ? "—" : kpis.openAlerts.toString()}
          sub="requer atenção"
        />
      </section>

      <ClientsPanel />
    </div>
  );
}
