// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClientCard } from "./ClientCard";

function renderCard(props: Partial<ComponentProps<typeof ClientCard>> = {}) {
  return render(
    <ClientCard
      name="Marcos Andrade"
      city="Porto Alegre, RS"
      kwp={5.4}
      generation="892 kWh"
      status="online"
      {...props}
    />
  );
}

describe("ClientCard", () => {
  it("renderiza nome, cidade, kWp e geração", () => {
    renderCard();

    expect(screen.getByText("Marcos Andrade")).toBeInTheDocument();
    expect(screen.getByText("Porto Alegre, RS")).toBeInTheDocument();
    expect(screen.getByText("5,4 kWp")).toBeInTheDocument();
    expect(screen.getByText("892 kWh")).toBeInTheDocument();
  });

  it("mostra a mensagem de alerta só quando `alert` é passado", () => {
    const { rerender } = renderCard({ alert: "Geração abaixo do esperado" });
    expect(screen.getByText("Geração abaixo do esperado")).toBeInTheDocument();

    rerender(
      <ClientCard name="Marcos Andrade" city="Porto Alegre, RS" kwp={5.4} generation="892 kWh" status="online" />
    );
    expect(screen.queryByText("Geração abaixo do esperado")).not.toBeInTheDocument();
  });

  it('com portalHref, "Ver portal" é um link real, seguro pra abrir em nova aba', () => {
    renderCard({ portalHref: "/c/abc123" });
    const link = screen.getByRole("link", { name: "Ver portal" });

    expect(link).toHaveAttribute("href", "/c/abc123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it('sem portalHref, "Ver portal" e "Copiar link" ficam desabilitados', () => {
    renderCard({ portalHref: undefined });

    expect(screen.queryByRole("link", { name: "Ver portal" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar link do portal" })).toBeDisabled();
  });

  it("copia o link absoluto do portal ao clicar em copiar", async () => {
    // `userEvent.setup()` instala seu próprio stub de `navigator.clipboard`
    // (usado pra simular copiar/colar via teclado) — por isso o setup roda
    // antes do nosso mock, senão ele sobrescreve o `writeText` espionado.
    const user = userEvent.setup();

    const writeText = vi.fn().mockResolvedValue(undefined);
    // `navigator.clipboard` já existe no jsdom como getter só-leitura — só
    // `defineProperty` (não `Object.assign`) consegue sobrescrever.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderCard({ portalHref: "/c/abc123" });

    await user.click(screen.getByRole("button", { name: "Copiar link do portal" }));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/c/abc123`);
  });

  it("chama onEdit ao clicar no botão de editar", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    renderCard({ onEdit });

    await user.click(screen.getByRole("button", { name: "Editar cliente" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
