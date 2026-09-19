"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ClientTableRow } from "@/components/ui/ClientTableRow";
import { ClientCard } from "@/components/ui/ClientCard";
import { EditClientModal } from "@/components/dashboard/EditClientModal";
import { useClients } from "@/lib/data/useClients";
import type { Client } from "@/lib/mock-data";
import type { StatusKind } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { normalizeForSearch } from "@/lib/text";

const STATUS_OPTIONS: { value: StatusKind; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "alert", label: "Alerta" },
  { value: "offline", label: "Offline" },
  { value: "inactive", label: "Inativo" },
];

const PAGE_SIZE = 10;

/**
 * Busca + filtro + tabela/cards de clientes, com edição via modal.
 * Usado tanto no painel (`/dashboard`) quanto na página dedicada
 * (`/clientes`) — ver docs/dashboard-integrador.md.
 */
export function ClientsPanel() {
  const clients = useClients();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<StatusKind[]>([]);
  const [page, setPage] = useState(1);

  const isLoading = clients === undefined;

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    const query = normalizeForSearch(searchQuery.trim());

    return clients.filter((client) => {
      const matchesSearch =
        query === "" ||
        normalizeForSearch(client.name).includes(query) ||
        normalizeForSearch(client.city).includes(query) ||
        normalizeForSearch(client.plant).includes(query);
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(client.status);
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilters]);

  const hasFilters = searchQuery.trim() !== "" || statusFilters.length > 0;

  // Clampa em vez de resetar via efeito: se um filtro reduzir o total de
  // páginas, a página exibida "desce" sozinha; ao voltar a ter mais
  // resultados, `page` (preservado) volta a valer.
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedClients = filteredClients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      {/* Mobile — lista de cards (DESIGN.md §4.4). */}
      <section className="flex flex-col gap-3 md:hidden">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-secondary">
            <SearchIcon />
          </span>
          <Input
            placeholder="Buscar cliente..."
            className="h-10 pl-9"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {isLoading && <LoadingHint />}
        {!isLoading && filteredClients.length === 0 && <EmptyHint hasFilters={hasFilters} />}

        {!isLoading &&
          pagedClients.map((client) => (
            <ClientCard
              key={client.id}
              name={client.name}
              city={client.city}
              kwp={client.kwp}
              generation={`${client.generationKwh.toLocaleString("pt-BR")} kWh`}
              status={client.status}
              alert={client.alert}
              portalHref={client.slug ? `/c/${client.slug}` : undefined}
              onEdit={() => setEditingClient(client)}
            />
          ))}

        {!isLoading && filteredClients.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="font-body text-xs text-neutral-secondary">
              {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredClients.length)} de{" "}
              {filteredClients.length}
            </span>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setPage(currentPage - 1)}
              onNext={() => setPage(currentPage + 1)}
            />
          </div>
        )}
      </section>

      {/* Desktop — tabela (DESIGN.md §4.2) */}
      <section className="hidden rounded-card border border-neutral-border bg-neutral-surface md:block">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border-md px-6 py-4">
          <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
            Clientes
          </h2>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar cliente..."
              className="h-10 w-56"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <StatusFilterMenu selected={statusFilters} onChange={setStatusFilters} />
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
                  Geração (mês)
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
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <LoadingHint />
                  </td>
                </tr>
              )}
              {!isLoading && filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <EmptyHint hasFilters={hasFilters} />
                  </td>
                </tr>
              )}
              {!isLoading &&
                pagedClients.map((client) => (
                  <ClientTableRow
                    key={client.id}
                    name={client.name}
                    plant={client.plant}
                    city={client.city}
                    kwp={client.kwp}
                    generationKwh={client.generationKwh}
                    status={client.status}
                    portalHref={client.slug ? `/c/${client.slug}` : undefined}
                    onEdit={() => setEditingClient(client)}
                  />
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <span className="font-body text-xs text-neutral-secondary">
            {isLoading
              ? "Carregando…"
              : filteredClients.length === 0
                ? `Mostrando 0 de ${clients.length}`
                : `Mostrando ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredClients.length)} de ${filteredClients.length}`}
          </span>
          {!isLoading && filteredClients.length > 0 && totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setPage(currentPage - 1)}
              onNext={() => setPage(currentPage + 1)}
            />
          )}
        </div>
      </section>

      <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} />
    </>
  );
}

function StatusFilterMenu({
  selected,
  onChange,
}: {
  selected: StatusKind[];
  onChange: (value: StatusKind[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(status: StatusKind) {
    onChange(
      selected.includes(status) ? selected.filter((value) => value !== status) : [...selected, status]
    );
  }

  return (
    <div className="relative">
      {open && (
        <div role="presentation" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-btn border border-neutral-border bg-neutral-surface p-1 shadow-lg">
          {STATUS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-btn-sm px-3 py-2 font-body text-sm text-neutral-body hover:bg-neutral-bg"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="h-4 w-4 accent-brand-emerald"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}

      <Button
        variant="neutral"
        size="sm"
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(selected.length > 0 && "border-brand-emerald text-brand-emerald")}
      >
        Filtrar{selected.length > 0 ? ` (${selected.length})` : ""}
      </Button>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="neutral" size="sm" onClick={onPrevious} disabled={currentPage <= 1}>
        Anterior
      </Button>
      <Button variant="neutral" size="sm" onClick={onNext} disabled={currentPage >= totalPages}>
        Próxima
      </Button>
    </div>
  );
}

function LoadingHint() {
  return <p className="font-body text-sm text-neutral-secondary">Carregando clientes…</p>;
}

function EmptyHint({ hasFilters }: { hasFilters: boolean }) {
  return (
    <p className="font-body text-sm text-neutral-secondary">
      {hasFilters
        ? "Nenhum cliente encontrado com esses filtros."
        : "Nenhum cliente cadastrado ainda."}
    </p>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
