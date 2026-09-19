"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useCalculationSettings,
  useUpdateCalculationSettings,
} from "@/lib/data/useCalculationSettings";

interface FormState {
  soilingLossPerDayPct: string;
  maxSoilingLossPct: string;
}

/**
 * Parâmetros de cálculo da geração — hoje só a perda por sujeira acumulada
 * desde a última limpeza (registrada pelo cliente no portal, ver
 * PortalView.tsx). Ver convex/lib/generation.ts::soilingFactor.
 */
export function CalculationSettingsForm() {
  const settings = useCalculationSettings();
  const updateSettings = useUpdateCalculationSettings();

  const [form, setForm] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  const isLoading = settings === undefined;

  // Congela o valor inicial assim que a query resolve, em vez de sincronizar
  // via useEffect — evita sobrescrever o que o integrador está digitando se
  // a query reatualizar entre o carregamento e o primeiro submit.
  if (form === null && settings !== undefined) {
    setForm({
      soilingLossPerDayPct: String(settings.soilingLossPerDayPct),
      maxSoilingLossPct: String(settings.maxSoilingLossPct),
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setFeedback(null);
    setSubmitting(true);

    updateSettings({
      soilingLossPerDayPct: Number(form.soilingLossPerDayPct),
      maxSoilingLossPct: Number(form.maxSoilingLossPct),
    })
      .then(() => setFeedback("success"))
      .catch(() => setFeedback("error"))
      .finally(() => setSubmitting(false));
  }

  return (
    <section className="max-w-lg rounded-card border border-neutral-border bg-neutral-surface p-6">
      <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
        Parâmetros de cálculo
      </h2>
      <p className="mt-1 font-body text-sm text-neutral-secondary">
        A geração estimada cai conforme os dias sem limpeza dos painéis, até o teto abaixo.
        Afeta todos os clientes deste tenant.
      </p>

      {isLoading || !form ? (
        <p className="mt-4 font-body text-sm text-neutral-secondary">Carregando…</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Input
            label="Perda de geração por dia sem limpeza (%)"
            type="number"
            step="0.1"
            min="0"
            value={form.soilingLossPerDayPct}
            onChange={(event) =>
              setForm({ ...form, soilingLossPerDayPct: event.target.value })
            }
            required
          />
          <Input
            label="Perda máxima acumulada por sujeira (%)"
            type="number"
            step="1"
            min="0"
            value={form.maxSoilingLossPct}
            onChange={(event) => setForm({ ...form, maxSoilingLossPct: event.target.value })}
            required
          />

          {feedback === "success" && (
            <p className="font-body text-sm text-brand-emerald">Parâmetros salvos.</p>
          )}
          {feedback === "error" && (
            <p className="font-body text-sm text-danger">
              Não foi possível salvar. Tente novamente.
            </p>
          )}

          <div>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
