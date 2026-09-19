"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/cn";

const statusView = {
  pending: { kind: "alert", label: "Pendente" },
  approved: { kind: "online", label: "Aprovado" },
  rejected: { kind: "offline", label: "Recusado" },
} as const;

export default function AcessosPage() {
  const requests = useQuery(api.accessRequests.list);
  const decide = useMutation(api.accessRequests.decide);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDecide(id: Id<"accessRequests">, approve: boolean) {
    setError(null);
    setBusyId(id);
    try {
      await decide({ requestId: id, approve });
    } catch {
      setError("Não foi possível salvar a decisão. Tente de novo.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-card border border-neutral-border bg-neutral-surface">
        <header className="border-b border-neutral-border-md px-6 py-5">
          <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
            Solicitações de acesso
          </h2>
          <p className="mt-1 font-body text-sm text-neutral-secondary">
            Quem entrou com Google sem ter conta aparece aqui. Ao aprovar, o
            próximo login da pessoa já leva ao painel.
          </p>
        </header>

        {requests === undefined ? (
          <p className="px-6 py-6 font-body text-sm text-neutral-secondary">Carregando…</p>
        ) : requests === null ? (
          <p className="px-6 py-6 font-body text-sm text-neutral-secondary">
            Esta área é restrita ao super admin.
          </p>
        ) : requests.length === 0 ? (
          <p className="px-6 py-6 font-body text-sm text-neutral-secondary">
            Nenhuma solicitação por enquanto.
          </p>
        ) : (
          <ul>
            {requests.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border-md px-6 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-avatar bg-gradient-to-br font-display text-xs font-semibold text-white",
                      getAvatarGradient(request.name)
                    )}
                  >
                    {getInitials(request.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body text-sm font-medium text-neutral-heading">
                      {request.name}
                    </span>
                    <span className="font-body text-xs text-neutral-secondary">{request.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={statusView[request.status].kind}
                    label={statusView[request.status].label}
                  />
                  {request.status !== "approved" && (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={busyId === request.id}
                      onClick={() => handleDecide(request.id, true)}
                    >
                      Aprovar
                    </Button>
                  )}
                  {request.status === "pending" && (
                    <Button
                      size="sm"
                      variant="neutral"
                      disabled={busyId === request.id}
                      onClick={() => handleDecide(request.id, false)}
                    >
                      Recusar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="px-6 pb-4 font-body text-sm text-danger">{error}</p>}
      </section>
    </div>
  );
}
