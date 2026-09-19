import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BarChart } from "@/components/ui/BarChart";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import { getPortalData } from "@/lib/mock-portal";

interface PortalPageParams {
  slug: string;
}

async function resolvePortal(params: Promise<PortalPageParams>) {
  const { slug } = await params;
  const portal = getPortalData(slug);
  if (!portal) notFound();
  return portal;
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[slug]">): Promise<Metadata> {
  const portal = await resolvePortal(params);
  return {
    title: `${portal.clientName} · Portal ${portal.integrator.name}`,
    description: `Geração de energia solar de ${portal.clientName} — powered by Solyo.`,
  };
}

export default async function PortalPage({ params }: PageProps<"/portal/[slug]">) {
  const portal = await resolvePortal(params);
  const { integrator } = portal;

  const statusLabel: Record<typeof portal.status, string> = {
    online: "Operacional",
    alert: "Requer atenção",
    offline: "Offline",
    inactive: "Inativo",
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="flex h-16 items-center justify-between border-b border-dark-border px-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] font-display text-sm font-bold text-white"
            style={{ backgroundColor: integrator.primaryHex }}
          >
            {integrator.logoInitials}
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-semibold text-white">
              {integrator.name}
            </span>
            <span className="mt-1 text-[10px] text-white/30">com tecnologia Solyo</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-avatar bg-gradient-to-br font-display text-xs font-semibold text-white",
              getAvatarGradient(portal.clientName)
            )}
          >
            {getInitials(portal.clientName)}
          </div>
          <span className="font-body text-sm text-white/80">{portal.clientName}</span>
        </div>
      </header>

      <section
        className="relative overflow-hidden px-8 py-14"
        style={{
          background: `linear-gradient(140deg, #081E14 0%, ${integrator.primaryHex} 40%, #062E22 70%, #040C18 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(242,164,34,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${integrator.primaryHex}55, transparent 70%)`,
          }}
        />

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4">
            <span className="font-body text-xs font-medium uppercase tracking-[0.8px] text-white/50">
              Geração hoje
            </span>
            <span className="font-display text-[64px] font-bold leading-none tracking-[-3px] text-white sm:text-[100px] sm:tracking-[-4px]">
              {portal.todayGenerationKwh.toLocaleString("pt-BR")}
              <span className="ml-2 text-2xl font-medium text-white/50 sm:text-4xl">kWh</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={portal.status} label={statusLabel[portal.status]} />
              <span className="rounded-badge border border-white/10 bg-white/5 px-2.5 py-1 font-body text-xs font-medium text-white/70">
                {portal.changeVsAverage}
              </span>
              <span className="font-body text-xs text-white/40">
                {portal.plant} · {portal.city}
              </span>
            </div>
          </div>

          <div className="w-full max-w-[560px] rounded-card border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-white">
                Geração diária
              </h2>
              <span className="font-body text-xs text-white/40">Últimos 14 dias</span>
            </div>
            <BarChart data={portal.dailyGeneration} className="h-[200px] w-full" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 divide-y divide-dark-border bg-dark-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <MetricCell
          value={`R$${portal.accumulatedSavingsBRL.toLocaleString("pt-BR")}`}
          label="acumulado"
        />
        <MetricCell value={`${portal.co2AvoidedKg.toLocaleString("pt-BR")} kg CO₂`} label="evitado" />
        <div className="flex h-[156px] flex-col items-center justify-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              portal.status === "online" && "bg-status-online-dot",
              portal.status === "alert" && "bg-status-alert-dot",
              portal.status === "offline" && "bg-status-offline-dot",
              portal.status === "inactive" && "bg-status-inactive-dot"
            )}
          />
          <span className="font-display text-lg font-bold text-white">
            {statusLabel[portal.status]}
          </span>
        </div>
      </section>
    </div>
  );
}

function MetricCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex h-[156px] flex-col items-center justify-center gap-1">
      <span className="font-display text-[28px] font-bold tracking-[-1px] text-white">
        {value}
      </span>
      <span className="font-body text-xs text-white/40">{label}</span>
    </div>
  );
}
