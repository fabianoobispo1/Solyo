// @vitest-environment jsdom
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

function Harness({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Título do modal">
      <button type="button">Ação 1</button>
      <button type="button">Ação 2</button>
    </Modal>
  );
}

describe("Modal", () => {
  it("não renderiza nada quando open=false", () => {
    render(<Harness open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza o título e os children quando open=true", () => {
    render(<Harness open={true} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Título do modal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ação 1" })).toBeInTheDocument();
  });

  it("chama onClose ao clicar no botão Fechar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness open={true} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose ao clicar fora do conteúdo (backdrop)", () => {
    const onClose = vi.fn();
    const { container } = render(<Harness open={true} onClose={onClose} />);
    const backdrop = container.querySelector('[role="presentation"]') as HTMLElement;

    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("não chama onClose ao clicar dentro do conteúdo do modal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness open={true} onClose={onClose} />);

    await user.click(screen.getByText("Título do modal"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("chama onClose ao pressionar Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness open={true} onClose={onClose} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("move o foco pro modal ao abrir", () => {
    render(<Harness open={true} onClose={() => {}} />);
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();
  });

  it("prende o Tab dentro do modal — do último elemento cicla de volta pro primeiro", async () => {
    const user = userEvent.setup();
    render(<Harness open={true} onClose={() => {}} />);

    screen.getByRole("button", { name: "Ação 2" }).focus();
    await user.tab();

    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();
  });

  it("devolve o foco pro elemento que estava focado antes de abrir", async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Abrir
          </button>
          <Modal open={open} onClose={() => setOpen(false)} title="Modal">
            <button type="button">Dentro</button>
          </Modal>
        </>
      );
    }

    render(<Wrapper />);

    const trigger = screen.getByRole("button", { name: "Abrir" });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
