"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCreatePlant } from "@/lib/data/usePlantMutations";

export function NewClientModal() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createPlant = useCreatePlant();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const ownerName = String(formData.get("ownerName") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const capacityKwp = Number(formData.get("capacityKwp"));

    createPlant({
      // O formulário não coleta um nome de usina separado — ver
      // docs/dashboard-integrador.md ("SEM refazer a UI").
      name: `Usina de ${ownerName}`,
      ownerName,
      city,
      capacityKwp,
    })
      .then(() => setSubmitted(true))
      .catch(() => setError("Não foi possível cadastrar o cliente. Tente novamente."))
      .finally(() => setSubmitting(false));
  }

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
    setError(null);
  }

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        + Novo cliente
      </Button>

      <Modal open={open} onClose={handleClose} title="Novo cliente">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <p className="font-body text-sm text-neutral-body">
              Cliente cadastrado com sucesso.
            </p>
            <Button variant="neutral" size="sm" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input name="ownerName" label="Nome do cliente" placeholder="Ex: Marcos Andrade" required />
            <Input name="city" label="Cidade" placeholder="Ex: Porto Alegre, RS" required />
            <Input
              name="capacityKwp"
              label="Potência instalada (kWp)"
              type="number"
              step="0.1"
              min="0"
              placeholder="5.4"
              required
            />
            {error && <p className="font-body text-sm text-danger">{error}</p>}
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                {submitting ? "Cadastrando…" : "Cadastrar"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
