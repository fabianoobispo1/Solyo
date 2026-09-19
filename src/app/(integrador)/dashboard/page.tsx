import { KPICard } from "@/components/ui/KPICard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ClientTableRow } from "@/components/ui/ClientTableRow";
import { mockClients, mockDashboardKpis } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          variant="filled"
          label="Geração total (mês)"
          value={`${mockDashboardKpis.totalGenerationKwh.toLocaleString("pt-BR")} kWh`}
          sub="+8% vs. mês anterior"
        />
        <KPICard
          label="Clientes ativos"
          value={mockDashboardKpis.activeClients.toString()}
          sub="+18 este mês"
        />
        <KPICard
          label="Economia gerada"
          value={`R$ ${(mockDashboardKpis.monthlySavingsBRL / 1000).toFixed(1)}k`}
          sub="acumulado no mês"
        />
        <KPICard
          label="Alertas ativos"
          value={mockDashboardKpis.openAlerts.toString()}
          sub="requer atenção"
        />
      </section>

      <section className="rounded-card border border-neutral-border bg-neutral-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border-md px-6 py-4">
          <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
            Clientes
          </h2>
          <div className="flex items-center gap-2">
            <Input placeholder="Buscar cliente..." className="h-10 w-56" />
            <Button variant="neutral" size="sm">
              Filtrar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-border-md text-left">
                <th className="py-3 pl-6 pr-4 font-body text-[11px] font-semibold uppercase tracking-[0.6px] text-neutral-secondary">
                  Cliente
                </th>
                <th className="py-3 px-4 font-body text-[11px] font-semibold uppercase tracking-[0.6px] text-neutral-secondary">
                  Cidade
                </th>
                <th className="py-3 px-4 text-right font-body text-[11px] font-semibold uppercase tracking-[0.6px] text-neutral-secondary">
                  kWp
                </th>
                <th className="py-3 px-4 text-right font-body text-[11px] font-semibold uppercase tracking-[0.6px] text-neutral-secondary">
                  Geração set.
                </th>
                <th className="py-3 px-4 font-body text-[11px] font-semibold uppercase tracking-[0.6px] text-neutral-secondary">
                  Status
                </th>
                <th className="py-3 pl-4 pr-6 font-body text-[11px] font-semibold uppercase tracking-[0.6px] text-neutral-secondary">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {mockClients.map((client) => (
                <ClientTableRow
                  key={client.id}
                  name={client.name}
                  plant={client.plant}
                  city={client.city}
                  kwp={client.kwp}
                  generationKwh={client.generationKwh}
                  status={client.status}
                  portalHref={client.slug ? `/portal/${client.slug}` : undefined}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <span className="font-body text-xs text-neutral-secondary">
            Mostrando 1–{mockClients.length} de {mockDashboardKpis.activeClients}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="neutral" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="neutral" size="sm">
              Próxima
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
