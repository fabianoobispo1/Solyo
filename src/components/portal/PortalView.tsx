"use client";

import { FormEvent, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BarChart } from "@/components/ui/BarChart";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import type { ClientPortalData } from "@/lib/mock-portal";

const statusLabel: Record<ClientPortalData["status"], string> = {
  online: "Operacional",
  alert: "Requer atenção",
  offline: "Offline",
  inactive: "Inativo",
};

export interface PortalViewProps {
  portal: ClientPortalData;
  /**
   * Quando presente, mostra o formulário de "registrar limpeza" — só a rota
   * real (`/c/[token]`) passa isso; a demo `/portal/[slug]` fica só com a
   * leitura, sem mutation nenhuma pra chamar.
   */
  onUpdateLastCleaning?: (lastCleaningAt: number) => Promise<void>;
}

/**
 * Composição visual do portal do cliente (DESIGN.md §4.3), compartilhada
 * entre a rota de demo `/portal/[slug]` (mock) e a rota real `/c/[token]`
 * (Convex) — ambas resolvem para o mesmo shape `ClientPortalData`, então a
 * UI nunca precisou ser refeita, só a fonte dos dados mudou.
 */
export function PortalView({ portal, onUpdateLastCleaning }: PortalViewProps) {
  const { integrator } = portal;

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="flex h-16 items-center justify-between gap-3 border-b border-dark-border px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] font-display text-sm font-bold text-white sm:h-[38px] sm:w-[38px]"
            style={{ backgroundColor: integrator.primaryHex }}
          >
            {integrator.logoInitials}
          </div>
          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-sm font-semibold text-white">
              {integrator.name}
            </span>
            <span className="mt-1 text-[10px] text-white/30">com tecnologia Solyo</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-avatar bg-gradient-to-br font-display text-xs font-semibold text-white",
              getAvatarGradient(portal.clientName)
            )}
          >
            {getInitials(portal.clientName)}
          </div>
          <span className="hidden max-w-[140px] truncate font-body text-sm text-white/80 sm:inline">
            {portal.clientName}
          </span>
        </div>
      </header>

      <section
        className="relative overflow-hidden px-5 py-10 sm:px-8 sm:py-14"
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

        <div className="relative flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4">
            <span className="font-body text-xs font-medium uppercase tracking-[0.8px] text-white/50">
              Geração hoje
            </span>
            <span className="font-display text-5xl font-bold leading-none tracking-[-2px] text-white sm:text-[64px] sm:tracking-[-3px] lg:text-[100px] lg:tracking-[-4px]">
              {portal.todayGenerationKwh.toLocaleString("pt-BR")}
              <span className="ml-2 text-xl font-medium text-white/50 sm:text-2xl lg:text-4xl">kWh</span>
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

          <div className="w-full max-w-[560px] rounded-card border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-white">
                Geração diária
              </h2>
              <span className="font-body text-xs text-white/40">Últimos 14 dias</span>
            </div>
            <BarChart data={portal.dailyGeneration} className="h-[160px] w-full sm:h-[200px]" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 divide-y divide-dark-border bg-dark-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <MetricCell
          value={`R$${portal.accumulatedSavingsBRL.toLocaleString("pt-BR")}`}
          label="acumulado"
        />
        <MetricCell value={`${portal.co2AvoidedKg.toLocaleString("pt-BR")} kg CO₂`} label="evitado" />
        <div className="flex h-[120px] flex-col items-center justify-center gap-2 sm:h-[156px]">
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

      <LastCleaningSection
        lastCleaningAt={portal.lastCleaningAt}
        onUpdateLastCleaning={onUpdateLastCleaning}
      />
    </div>
  );
}

function LastCleaningSection({
  lastCleaningAt,
  onUpdateLastCleaning,
}: {
  lastCleaningAt: number | null;
  onUpdateLastCleaning?: (lastCleaningAt: number) => Promise<void>;
}) {
  const [today] = useState(() => toDateInputValue(Date.now()));
  const [date, setDate] = useState(today);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onUpdateLastCleaning || !date) return;

    setError(null);
    setSubmitting(true);
    try {
      await onUpdateLastCleaning(new Date(`${date}T00:00:00`).getTime());
    } catch {
      setError("Não foi possível atualizar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-dark-border px-5 py-6 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold text-white">
            Última limpeza dos painéis
          </h2>
          <p className="mt-1 font-body text-xs text-white/50">
            {lastCleaningAt
              ? `Registrada em ${new Date(lastCleaningAt).toLocaleDateString("pt-BR")}`
              : "Ainda não registrada"}{" "}
            — sujeira acumulada reduz a geração estimada.
          </p>
        </div>

        {onUpdateLastCleaning && (
          <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={date}
              max={today}
              onChange={(event) => setDate(event.target.value)}
              className="h-9 rounded-btn border border-white/15 bg-white/5 px-3 font-body text-sm text-white outline-none focus:border-white/40"
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-9 rounded-btn border border-white/15 px-3 font-body text-sm font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Salvando…" : "Registrar limpeza"}
            </button>
          </form>
        )}
      </div>
      {error && <p className="mt-2 text-center font-body text-xs text-status-alert-dot sm:text-left">{error}</p>}
    </section>
  );
}

function toDateInputValue(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

function MetricCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex h-[120px] flex-col items-center justify-center gap-1 sm:h-[156px]">
      <span className="font-display text-2xl font-bold tracking-[-0.5px] text-white sm:text-[28px] sm:tracking-[-1px]">
        {value}
      </span>
      <span className="font-body text-xs text-white/40">{label}</span>
    </div>
  );
}
