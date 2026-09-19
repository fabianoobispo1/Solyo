// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClientTableRow } from "./ClientTableRow";

function renderRow(props: Partial<ComponentProps<typeof ClientTableRow>> = {}) {
  return render(
    <table>
      <tbody>
        <ClientTableRow
          name="Marcos Andrade"
          plant="Residência Jardim Europa"
          city="Porto Alegre, RS"
          kwp={5.4}
          generationKwh={892}
          status="online"
          {...props}
        />
      </tbody>
    </table>
  );
}

describe("ClientTableRow", () => {
  it("renderiza nome, usina, cidade, kWp e geração formatados", () => {
    renderRow();

    expect(screen.getByText("Marcos Andrade")).toBeInTheDocument();
    expect(screen.getByText("Residência Jardim Europa")).toBeInTheDocument();
    expect(screen.getByText("Porto Alegre, RS")).toBeInTheDocument();
    expect(screen.getByText("5,4 kWp")).toBeInTheDocument();
    expect(screen.getByText("892 kWh")).toBeInTheDocument();
  });

  it("mostra o StatusBadge com o label certo pra cada status", () => {
    renderRow({ status: "alert" });
    expect(screen.getByText("Alerta")).toBeInTheDocument();
  });

  it("destaca a linha (bg de alerta) quando status=alert", () => {
    const { container } = renderRow({ status: "alert" });
    expect(container.querySelector("tr")).toHaveClass("bg-status-alert-row");
  });

  it("não destaca a linha pra outros status", () => {
    const { container } = renderRow({ status: "online" });
    expect(container.querySelector("tr")).not.toHaveClass("bg-status-alert-row");
  });

  it('com portalHref, "Ver portal" é um link real, seguro pra abrir em nova aba', () => {
    renderRow({ portalHref: "/c/abc123" });
    const link = screen.getByRole("link", { name: "Ver portal" });

    expect(link).toHaveAttribute("href", "/c/abc123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it('sem portalHref, "Ver portal" aparece desabilitado (não é um link)', () => {
    renderRow({ portalHref: undefined });
    expect(screen.queryByRole("link", { name: "Ver portal" })).not.toBeInTheDocument();
    expect(screen.getByText("Ver portal")).toBeInTheDocument();
  });

  it("chama onEdit ao clicar no botão de editar", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    renderRow({ onEdit });

    await user.click(screen.getByRole("button", { name: "Editar cliente" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
