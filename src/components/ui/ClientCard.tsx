"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { StatusBadge, StatusKind } from "@/components/ui/StatusBadge";

export interface ClientCardProps {
  name: string;
  city: string;
  kwp: number;
  generation: string;
  status: StatusKind;
  alert?: string;
  /** /portal/[slug] do cliente. Sem valor, as ações ficam desabilitadas. */
  portalHref?: string;
  onEdit?: () => void;
}

const statusLabel: Record<StatusKind, string> = {
  online: "Online",
  alert: "Alerta",
  offline: "Offline",
  inactive: "Inativo",
};

export function ClientCard({
  name,
  city,
  kwp,
  generation,
  status,
  alert,
  portalHref,
  onEdit,
}: ClientCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    if (!portalHref) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${portalHref}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard indisponível (ex: contexto não seguro) — falha silenciosa, ver docs/dashboard-integrador.md.
    }
  }

  return (
    <div
      className={cn(
        "rounded-[14px] border border-neutral-border bg-neutral-surface p-4",
        alert && "border-l-[3px] border-l-brand-amber"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-avatar bg-gradient-to-br font-display text-xs font-semibold text-white",
              getAvatarGradient(name)
            )}
          >
            {getInitials(name)}
          </div>
          <div className="flex flex-col">
            <span className="font-body text-sm font-medium text-neutral-heading">{name}</span>
            <span className="font-body text-xs text-neutral-secondary">{city}</span>
          </div>
        </div>
        <StatusBadge status={status} label={statusLabel[status]} />
      </div>

      {alert && (
        <p className="mt-2 font-body text-xs text-status-alert-txt">{alert}</p>
      )}

      <div className="mt-3 flex items-center justify-between font-body text-xs text-neutral-secondary">
        <span>{kwp.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} kWp</span>
        <span>{generation}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {portalHref ? (
          <Link
            href={portalHref}
            target="_blank"
            className="inline-flex h-9 flex-1 items-center justify-center rounded-btn border border-brand-emerald font-body text-sm font-medium text-brand-emerald"
          >
            Ver portal
          </Link>
        ) : (
          <span
            title="Portal ainda não configurado para este cliente"
            className="inline-flex h-9 flex-1 cursor-not-allowed items-center justify-center rounded-btn border border-neutral-border font-body text-sm font-medium text-neutral-muted"
          >
            Ver portal
          </span>
        )}
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={!portalHref}
          aria-label="Copiar link do portal"
          className="flex h-9 w-9 items-center justify-center rounded-btn border border-neutral-border text-neutral-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5 6.5 12 13 4.5" stroke="#0C5A46" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3 10.5V4a1 1 0 0 1 1-1h6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar cliente"
          className="flex h-9 w-9 items-center justify-center rounded-btn border border-neutral-border text-neutral-secondary"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="3" cy="8" r="1.4" fill="currentColor" />
            <circle cx="8" cy="8" r="1.4" fill="currentColor" />
            <circle cx="13" cy="8" r="1.4" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
