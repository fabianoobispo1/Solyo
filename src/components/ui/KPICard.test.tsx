// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KPICard } from "./KPICard";

describe("KPICard", () => {
  it("renderiza label e value", () => {
    render(<KPICard label="Clientes ativos" value="248" />);
    expect(screen.getByText("Clientes ativos")).toBeInTheDocument();
    expect(screen.getByText("248")).toBeInTheDocument();
  });

  it("renderiza sub só quando passado", () => {
    const { rerender } = render(<KPICard label="X" value="1" sub="acumulado" />);
    expect(screen.getByText("acumulado")).toBeInTheDocument();

    rerender(<KPICard label="X" value="1" />);
    expect(screen.queryByText("acumulado")).not.toBeInTheDocument();
  });

  it("renderiza o ícone só quando passado", () => {
    const { container, rerender } = render(
      <KPICard label="X" value="1" icon={<span data-testid="icon" />} />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();

    rerender(<KPICard label="X" value="1" />);
    expect(container.querySelector('[data-testid="icon"]')).not.toBeInTheDocument();
  });

  it("variant=filled usa fundo esmeralda; variant=outline (padrão) usa borda neutra", () => {
    const { container, rerender } = render(<KPICard label="X" value="1" variant="filled" />);
    expect(container.firstChild).toHaveClass("bg-brand-emerald");

    rerender(<KPICard label="X" value="1" />);
    expect(container.firstChild).toHaveClass("border-neutral-border");
  });
});
