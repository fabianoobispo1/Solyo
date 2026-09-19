import Link from "next/link";
import { cn } from "@/lib/cn";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { StatusBadge, StatusKind } from "@/components/ui/StatusBadge";

export interface ClientTableRowProps {
  name: string;
  plant: string;
  city: string;
  kwp: number;
  generationKwh: number;
  status: StatusKind;
  /** /portal/[slug] do cliente. Sem valor, o link "Ver portal" aparece desabilitado. */
  portalHref?: string;
  onEdit?: () => void;
}

export function ClientTableRow({
  name,
  plant,
  city,
  kwp,
  generationKwh,
  status,
  portalHref,
  onEdit,
}: ClientTableRowProps) {
  const isAlertRow = status === "alert";

  return (
    <tr className={cn("border-b border-neutral-border-md last:border-b-0", isAlertRow && "bg-status-alert-row")}>
      <td className="py-3.5 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-avatar bg-gradient-to-br font-display text-xs font-semibold text-white",
              getAvatarGradient(name)
            )}
          >
            {getInitials(name)}
          </div>
          <div className="flex flex-col">
            <span className="font-body text-sm font-medium text-neutral-heading">
              {name}
            </span>
            <span className="font-body text-xs text-neutral-secondary">
              {plant}
            </span>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 font-body text-sm text-neutral-body">{city}</td>
      <td className="py-3.5 px-4 text-right font-body text-sm text-neutral-body">
        {kwp.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWp
      </td>
      <td className="py-3.5 px-4 text-right font-body text-sm text-neutral-body">
        {generationKwh.toLocaleString("pt-BR")} kWh
      </td>
      <td className="py-3.5 px-4">
        <StatusBadge
          status={status}
          label={
            { online: "Online", alert: "Alerta", offline: "Offline", inactive: "Inativo" }[
              status
            ]
          }
        />
      </td>
      <td className="py-3.5 pl-4 pr-6">
        <div className="flex items-center justify-end gap-2">
          {portalHref ? (
            <Link
              href={portalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[38px] items-center justify-center rounded-btn border border-brand-emerald px-4 font-body text-sm font-medium text-brand-emerald hover:bg-brand-emerald/5"
            >
              Ver portal
            </Link>
          ) : (
            <span
              title="Portal ainda não configurado para este cliente"
              className="inline-flex h-[38px] cursor-not-allowed items-center justify-center rounded-btn border border-neutral-border px-4 font-body text-sm font-medium text-neutral-muted"
            >
              Ver portal
            </span>
          )}
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar cliente"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-btn-sm text-neutral-secondary hover:bg-neutral-bg"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="3" cy="8" r="1.4" fill="currentColor" />
              <circle cx="8" cy="8" r="1.4" fill="currentColor" />
              <circle cx="13" cy="8" r="1.4" fill="currentColor" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
