// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClientsPanel } from "./ClientsPanel";
import { useClients } from "@/lib/data/useClients";
import type { Client } from "@/lib/mock-data";

vi.mock("@/lib/data/useClients", () => ({
  useClients: vi.fn(),
}));

vi.mock("@/lib/data/usePlantMutations", () => ({
  useUpdatePlant: vi.fn(() => vi.fn()),
}));

const useClientsMock = vi.mocked(useClients);

function makeClients(count: number): Client[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `cl_${index}`,
    name: `Cliente ${String(index).padStart(2, "0")}`,
    plant: `Usina ${index}`,
    city: "Porto Alegre, RS",
    kwp: 5,
    generationKwh: 500,
    status: "online" as const,
    slug: `token-${index}`,
  }));
}

// A tabela desktop é a única visível no jsdom (sem media query real), então
// os testes leem sempre dentro dela.
function desktopTable() {
  return within(screen.getAllByRole("table")[0].closest("section") as HTMLElement);
}

describe("ClientsPanel — paginação", () => {
  beforeEach(() => {
    useClientsMock.mockReset();
  });

  it("mostra só os 10 primeiros clientes e o total correto no rodapé", () => {
    useClientsMock.mockReturnValue(makeClients(25));
    render(<ClientsPanel />);

    const table = desktopTable();
    expect(table.getByText("Cliente 00")).toBeInTheDocument();
    expect(table.getByText("Cliente 09")).toBeInTheDocument();
    expect(table.queryByText("Cliente 10")).not.toBeInTheDocument();
    expect(table.getByText("Mostrando 1–10 de 25")).toBeInTheDocument();
  });

  it("'Anterior' começa desabilitado; 'Próxima' avança a página", async () => {
    useClientsMock.mockReturnValue(makeClients(25));
    const user = userEvent.setup();
    render(<ClientsPanel />);

    const table = desktopTable();
    expect(table.getByRole("button", { name: "Anterior" })).toBeDisabled();

    await user.click(table.getByRole("button", { name: "Próxima" }));

    expect(table.getByText("Cliente 10")).toBeInTheDocument();
    expect(table.queryByText("Cliente 00")).not.toBeInTheDocument();
    expect(table.getByText("Mostrando 11–20 de 25")).toBeInTheDocument();
    expect(table.getByRole("button", { name: "Anterior" })).not.toBeDisabled();
  });

  it("'Próxima' desabilita na última página (25 itens = 3 páginas)", async () => {
    useClientsMock.mockReturnValue(makeClients(25));
    const user = userEvent.setup();
    render(<ClientsPanel />);

    const table = desktopTable();
    await user.click(table.getByRole("button", { name: "Próxima" }));
    await user.click(table.getByRole("button", { name: "Próxima" }));

    expect(table.getByText("Mostrando 21–25 de 25")).toBeInTheDocument();
    expect(table.getByRole("button", { name: "Próxima" })).toBeDisabled();
  });

  it("filtrar a busca volta a mostrar a página com os resultados (clamp)", async () => {
    useClientsMock.mockReturnValue(makeClients(25));
    const user = userEvent.setup();
    render(<ClientsPanel />);

    const table = desktopTable();
    await user.click(table.getByRole("button", { name: "Próxima" }));
    await user.click(table.getByRole("button", { name: "Próxima" }));
    expect(table.getByText("Mostrando 21–25 de 25")).toBeInTheDocument();

    await user.type(table.getByPlaceholderText("Buscar cliente..."), "Cliente 00");

    expect(table.getByText("Mostrando 1–1 de 1")).toBeInTheDocument();
    expect(table.getByText("Cliente 00")).toBeInTheDocument();
  });

  it("sem paginação necessária (≤10 itens), não mostra os botões", () => {
    useClientsMock.mockReturnValue(makeClients(3));
    render(<ClientsPanel />);

    const table = desktopTable();
    expect(table.queryByRole("button", { name: "Anterior" })).not.toBeInTheDocument();
    expect(table.queryByRole("button", { name: "Próxima" })).not.toBeInTheDocument();
  });
});
