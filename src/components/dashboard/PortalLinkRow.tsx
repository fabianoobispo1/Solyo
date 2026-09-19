"use client";

import { useState } from "react";
import Link from "next/link";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/cn";

export interface PortalLinkRowProps {
  name: string;
  city: string;
  /** /c/[token] do cliente. Sem valor, as ações ficam desabilitadas. */
  portalHref?: string;
}

export function PortalLinkRow({ name, city, portalHref }: PortalLinkRowProps) {
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border-md px-6 py-4 last:border-b-0">
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

      <div className="flex items-center gap-2">
        {portalHref ? (
          <>
            <span className="max-w-[220px] truncate font-body text-xs text-neutral-secondary">
              {portalHref}
            </span>
            <Link
              href={portalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-btn border border-brand-emerald px-3 font-body text-sm font-medium text-brand-emerald"
            >
              Abrir portal
            </Link>
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Copiar link do portal"
              className="flex h-9 w-9 items-center justify-center rounded-btn border border-neutral-border text-neutral-secondary"
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8.5 6.5 12 13 4.5"
                    stroke="#0C5A46"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3 10.5V4a1 1 0 0 1 1-1h6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </>
        ) : (
          <span
            title="Portal ainda não configurado para este cliente"
            className="inline-flex h-9 cursor-not-allowed items-center justify-center rounded-btn border border-neutral-border px-3 font-body text-sm font-medium text-neutral-muted"
          >
            Portal não configurado
          </span>
        )}
      </div>
    </div>
  );
}
