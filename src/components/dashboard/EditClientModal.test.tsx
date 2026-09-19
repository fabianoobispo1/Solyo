// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { EditClientModal } from "./EditClientModal";
import { useUpdatePlant } from "@/lib/data/usePlantMutations";
import type { Client } from "@/lib/mock-data";

vi.mock("@/lib/data/usePlantMutations", () => ({
  useUpdatePlant: vi.fn(),
}));

const useUpdatePlantMock = vi.mocked(useUpdatePlant);

// `useMutation` do Convex devolve uma função com métodos extras
// (`withOptimisticUpdate`) que um `vi.fn()` simples não satisfaz — o cast
// é só pra calar o TypeScript, o mock em si só precisa ser chamável.
function asUpdatePlant(fn: ReturnType<typeof vi.fn>) {
  return fn as unknown as ReturnType<typeof useUpdatePlant>;
}

const client: Client = {
  id: "cl_01",
  name: "Marcos Andrade",
  plant: "Residência Jardim Europa",
  city: "Porto Alegre, RS",
  kwp: 5.4,
  generationKwh: 892,
  status: "online",
};

describe("EditClientModal", () => {
  beforeEach(() => {
    useUpdatePlantMock.mockReset();
  });

  it("não renderiza o modal quando client é null", () => {
    useUpdatePlantMock.mockReturnValue(asUpdatePlant(vi.fn()));
    render(<EditClientModal client={null} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preenche o formulário com os dados atuais do cliente", () => {
    useUpdatePlantMock.mockReturnValue(asUpdatePlant(vi.fn()));
    render(<EditClientModal client={client} onClose={vi.fn()} />);

    expect(screen.getByLabelText("Nome do cliente")).toHaveValue("Marcos Andrade");
    expect(screen.getByLabelText("Cidade")).toHaveValue("Porto Alegre, RS");
    expect(screen.getByLabelText("Potência instalada (kWp)")).toHaveValue(5.4);
  });

  it("chama updatePlant com o id do cliente e os dados editados, e fecha ao salvar", async () => {
    const updatePlant = vi.fn().mockResolvedValue(undefined);
    useUpdatePlantMock.mockReturnValue(asUpdatePlant(updatePlant));
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<EditClientModal client={client} onClose={onClose} />);

    const cityInput = screen.getByLabelText("Cidade");
    await user.clear(cityInput);
    await user.type(cityInput, "Canoas, RS");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(updatePlant).toHaveBeenCalledWith({
        plantId: client.id,
        ownerName: "Marcos Andrade",
        city: "Canoas, RS",
        capacityKwp: 5.4,
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("mostra mensagem de erro se updatePlant falhar e não fecha o modal", async () => {
    useUpdatePlantMock.mockReturnValue(asUpdatePlant(vi.fn().mockRejectedValue(new Error("fail"))));
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<EditClientModal client={client} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      await screen.findByText("Não foi possível salvar as alterações. Tente novamente.")
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("chama onClose ao cancelar", async () => {
    useUpdatePlantMock.mockReturnValue(asUpdatePlant(vi.fn()));
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<EditClientModal client={client} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
