"use client";

import { PortalLinkRow } from "@/components/dashboard/PortalLinkRow";
import { useClients } from "@/lib/data/useClients";

export default function PortaisPage() {
  const clients = useClients();
  const isLoading = clients === undefined;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-card border border-neutral-border bg-neutral-surface">
        <div className="border-b border-neutral-border-md px-6 py-4">
          <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
            Portais dos clientes
          </h2>
          <p className="mt-1 font-body text-sm text-neutral-secondary">
            Cada cliente tem um link único e não-adivinhável pra acompanhar a própria usina,
            sem precisar de login.
          </p>
        </div>

        {isLoading && (
          <p className="px-6 py-8 font-body text-sm text-neutral-secondary">
            Carregando portais…
          </p>
        )}

        {!isLoading && clients.length === 0 && (
          <p className="px-6 py-8 font-body text-sm text-neutral-secondary">
            Nenhum cliente cadastrado ainda.
          </p>
        )}

        {!isLoading &&
          clients.map((client) => (
            <PortalLinkRow
              key={client.id}
              name={client.name}
              city={client.city}
              portalHref={client.slug ? `/c/${client.slug}` : undefined}
            />
          ))}
      </section>
    </div>
  );
}
