"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useUpdatePlant } from "@/lib/data/usePlantMutations";
import type { Client } from "@/lib/mock-data";
import type { Id } from "../../../convex/_generated/dataModel";

export interface EditClientModalProps {
  client: Client | null;
  onClose: () => void;
}

export function EditClientModal({ client, onClose }: EditClientModalProps) {
  const updatePlant = useUpdatePlant();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;

    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const ownerName = String(formData.get("ownerName") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const capacityKwp = Number(formData.get("capacityKwp"));

    updatePlant({
      plantId: client.id as Id<"plants">,
      ownerName,
      city,
      capacityKwp,
    })
      .then(() => onClose())
      .catch(() => setError("Não foi possível salvar as alterações. Tente novamente."))
      .finally(() => setSubmitting(false));
  }

  return (
    <Modal open={client !== null} onClose={onClose} title="Editar cliente">
      {client && (
        <form key={client.id} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input name="ownerName" label="Nome do cliente" defaultValue={client.name} required />
          <Input name="city" label="Cidade" defaultValue={client.city} required />
          <Input
            name="capacityKwp"
            label="Potência instalada (kWp)"
            type="number"
            step="0.1"
            min="0"
            defaultValue={client.kwp}
            required
          />
          <p className="font-body text-xs text-neutral-secondary">
            Última limpeza:{" "}
            {client.lastCleaningAt
              ? new Date(client.lastCleaningAt).toLocaleDateString("pt-BR")
              : "ainda não registrada"}{" "}
            — registrada pelo próprio cliente no portal dele.
          </p>
          {error && <p className="font-body text-sm text-danger">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
