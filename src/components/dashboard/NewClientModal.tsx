"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function NewClientModal() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
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
              Cliente cadastrado (mock) — nenhum dado foi persistido, ver
              docs/dashboard-integrador.md.
            </p>
            <Button variant="neutral" size="sm" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Nome do cliente" placeholder="Ex: Marcos Andrade" required />
            <Input label="Cidade" placeholder="Ex: Porto Alegre, RS" required />
            <Input
              label="Potência instalada (kWp)"
              type="number"
              step="0.1"
              min="0"
              placeholder="5.4"
              required
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Cadastrar
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
