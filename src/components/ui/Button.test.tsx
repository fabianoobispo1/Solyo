// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renderiza o texto passado como children", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("dispara onClick ao clicar", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Entrar</Button>);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("não dispara onClick quando disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Cadastrar
      </Button>
    );

    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("aplica as classes do variant e do size pedidos", () => {
    render(
      <Button variant="danger" size="lg">
        Excluir
      </Button>
    );
    const button = screen.getByRole("button", { name: "Excluir" });

    expect(button.className).toContain("bg-danger");
    expect(button.className).toContain("h-[54px]");
  });

  it("usa variant=primary e size=md como padrão", () => {
    render(<Button>Padrão</Button>);
    const button = screen.getByRole("button", { name: "Padrão" });

    expect(button.className).toContain("bg-brand-emerald");
    expect(button.className).toContain("h-12");
  });

  it("repassa a ref pro elemento <button> nativo", () => {
    let ref: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(node) => {
          ref = node;
        }}
      >
        Com ref
      </Button>
    );

    expect(ref).toBeInstanceOf(HTMLButtonElement);
  });
});
