// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("associa o label ao campo (getByLabelText funciona)", () => {
    render(<Input label="E-mail" />);
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  });

  it("aceita digitação (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Input label="Nome" />);
    const input = screen.getByLabelText("Nome");

    await user.type(input, "Marcos Andrade");

    expect(input).toHaveValue("Marcos Andrade");
  });

  it("mostra a mensagem de erro e marca aria-invalid quando `error` é passado", () => {
    render(<Input label="Senha" error="Senha deve ter ao menos 8 caracteres" />);

    expect(screen.getByText("Senha deve ter ao menos 8 caracteres")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toHaveAttribute("aria-invalid", "true");
  });

  it("não marca aria-invalid quando não há erro", () => {
    render(<Input label="Cidade" />);
    expect(screen.getByLabelText("Cidade")).toHaveAttribute("aria-invalid", "false");
  });

  it("gera um id próprio quando nenhum é passado, ligando label e input", () => {
    render(<Input label="Potência (kWp)" />);
    const input = screen.getByLabelText("Potência (kWp)");
    expect(input.id).toBeTruthy();
  });
});
