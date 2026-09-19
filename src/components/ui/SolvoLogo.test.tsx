// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SolvoLogo } from "./SolvoLogo";

describe("SolvoLogo", () => {
  it("mostra o wordmark 'Solyo' por padrão", () => {
    render(<SolvoLogo />);
    expect(screen.getByText("Solyo")).toBeInTheDocument();
  });

  it("esconde o wordmark quando showWordmark=false", () => {
    render(<SolvoLogo showWordmark={false} />);
    expect(screen.queryByText("Solyo")).not.toBeInTheDocument();
  });

  it("usa o tamanho padrão de 36 quando `size` não é passado", () => {
    const { container } = render(<SolvoLogo />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "36");
    expect(svg).toHaveAttribute("height", "36");
  });

  it("aplica o `size` customizado ao svg", () => {
    const { container } = render(<SolvoLogo size={48} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
  });

  it("variant=dark deixa o texto branco (pra usar sobre fundo escuro)", () => {
    render(<SolvoLogo variant="dark" />);
    expect(screen.getByText("Solyo")).toHaveClass("text-white");
  });
});
