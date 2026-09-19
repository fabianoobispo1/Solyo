// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PortalLinkRow } from "./PortalLinkRow";

function renderRow(props: Partial<ComponentProps<typeof PortalLinkRow>> = {}) {
  return render(<PortalLinkRow name="Marcos Andrade" city="Porto Alegre, RS" {...props} />);
}

describe("PortalLinkRow", () => {
  it("renderiza nome e cidade", () => {
    renderRow();
    expect(screen.getByText("Marcos Andrade")).toBeInTheDocument();
    expect(screen.getByText("Porto Alegre, RS")).toBeInTheDocument();
  });

  it('com portalHref, "Abrir portal" é um link real, seguro pra abrir em nova aba', () => {
    renderRow({ portalHref: "/c/abc123" });
    const link = screen.getByRole("link", { name: "Abrir portal" });

    expect(link).toHaveAttribute("href", "/c/abc123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("sem portalHref, mostra estado desabilitado sem link nem botão de copiar", () => {
    renderRow({ portalHref: undefined });

    expect(screen.queryByRole("link", { name: "Abrir portal" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copiar link do portal" })).not.toBeInTheDocument();
    expect(screen.getByText("Portal não configurado")).toBeInTheDocument();
  });

  it("copia o link absoluto do portal ao clicar em copiar", async () => {
    const user = userEvent.setup();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderRow({ portalHref: "/c/abc123" });

    await user.click(screen.getByRole("button", { name: "Copiar link do portal" }));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/c/abc123`);
  });
});
