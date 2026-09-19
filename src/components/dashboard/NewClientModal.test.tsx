// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NewClientModal } from "./NewClientModal";
import { useCreatePlant } from "@/lib/data/usePlantMutations";

vi.mock("@/lib/data/usePlantMutations", () => ({
  useCreatePlant: vi.fn(),
}));

const useCreatePlantMock = vi.mocked(useCreatePlant);

// `useMutation` do Convex devolve uma função com métodos extras
// (`withOptimisticUpdate`) que um `vi.fn()` simples não satisfaz — o cast
// é só pra calar o TypeScript, o mock em si só precisa ser chamável.
function asCreatePlant(fn: ReturnType<typeof vi.fn>) {
  return fn as unknown as ReturnType<typeof useCreatePlant>;
}

async function openModalAndFill(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "+ Novo cliente" }));
  await user.type(screen.getByLabelText("Nome do cliente"), "Marcos Andrade");
  await user.type(screen.getByLabelText("Cidade"), "Porto Alegre, RS");
  await user.type(screen.getByLabelText("Potência instalada (kWp)"), "5.4");
}

describe("NewClientModal", () => {
  beforeEach(() => {
    useCreatePlantMock.mockReset();
  });

  it("abre o modal ao clicar em '+ Novo cliente'", async () => {
    useCreatePlantMock.mockReturnValue(asCreatePlant(vi.fn()));
    const user = userEvent.setup();
    render(<NewClientModal />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "+ Novo cliente" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("chama createPlant com os dados do formulário, prefixando o nome da usina", async () => {
    const createPlant = vi.fn().mockResolvedValue(undefined);
    useCreatePlantMock.mockReturnValue(asCreatePlant(createPlant));
    const user = userEvent.setup();
    render(<NewClientModal />);

    await openModalAndFill(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() =>
      expect(createPlant).toHaveBeenCalledWith({
        name: "Usina de Marcos Andrade",
        ownerName: "Marcos Andrade",
        city: "Porto Alegre, RS",
        capacityKwp: 5.4,
      })
    );
  });

  it("mostra confirmação de sucesso após cadastrar", async () => {
    useCreatePlantMock.mockReturnValue(asCreatePlant(vi.fn().mockResolvedValue(undefined)));
    const user = userEvent.setup();
    render(<NewClientModal />);

    await openModalAndFill(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(await screen.findByText("Cliente cadastrado com sucesso.")).toBeInTheDocument();
  });

  it("mostra mensagem de erro se createPlant falhar", async () => {
    useCreatePlantMock.mockReturnValue(asCreatePlant(vi.fn().mockRejectedValue(new Error("fail"))));
    const user = userEvent.setup();
    render(<NewClientModal />);

    await openModalAndFill(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(
      await screen.findByText("Não foi possível cadastrar o cliente. Tente novamente.")
    ).toBeInTheDocument();
  });

  it("fecha e reseta o estado ao cancelar", async () => {
    useCreatePlantMock.mockReturnValue(asCreatePlant(vi.fn()));
    const user = userEvent.setup();
    render(<NewClientModal />);

    await user.click(screen.getByRole("button", { name: "+ Novo cliente" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
