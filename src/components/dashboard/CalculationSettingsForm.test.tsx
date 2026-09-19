// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CalculationSettingsForm } from "./CalculationSettingsForm";
import {
  useCalculationSettings,
  useUpdateCalculationSettings,
} from "@/lib/data/useCalculationSettings";

vi.mock("@/lib/data/useCalculationSettings", () => ({
  useCalculationSettings: vi.fn(),
  useUpdateCalculationSettings: vi.fn(),
}));

const useCalculationSettingsMock = vi.mocked(useCalculationSettings);
const useUpdateCalculationSettingsMock = vi.mocked(useUpdateCalculationSettings);

function asUpdateSettings(fn: ReturnType<typeof vi.fn>) {
  return fn as unknown as ReturnType<typeof useUpdateCalculationSettings>;
}

describe("CalculationSettingsForm", () => {
  beforeEach(() => {
    useCalculationSettingsMock.mockReset();
    useUpdateCalculationSettingsMock.mockReset();
  });

  it("mostra 'Carregando…' enquanto a query não resolve", () => {
    useCalculationSettingsMock.mockReturnValue(undefined);
    useUpdateCalculationSettingsMock.mockReturnValue(asUpdateSettings(vi.fn()));
    render(<CalculationSettingsForm />);

    expect(screen.getByText("Carregando…")).toBeInTheDocument();
  });

  it("preenche o formulário com os valores atuais", () => {
    useCalculationSettingsMock.mockReturnValue({
      soilingLossPerDayPct: 0.3,
      maxSoilingLossPct: 15,
    });
    useUpdateCalculationSettingsMock.mockReturnValue(asUpdateSettings(vi.fn()));
    render(<CalculationSettingsForm />);

    expect(screen.getByLabelText("Perda de geração por dia sem limpeza (%)")).toHaveValue(0.3);
    expect(screen.getByLabelText("Perda máxima acumulada por sujeira (%)")).toHaveValue(15);
  });

  it("salva os valores editados e mostra confirmação", async () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined);
    useCalculationSettingsMock.mockReturnValue({
      soilingLossPerDayPct: 0.3,
      maxSoilingLossPct: 15,
    });
    useUpdateCalculationSettingsMock.mockReturnValue(asUpdateSettings(updateSettings));
    const user = userEvent.setup();
    render(<CalculationSettingsForm />);

    const maxLossInput = screen.getByLabelText("Perda máxima acumulada por sujeira (%)");
    await user.clear(maxLossInput);
    await user.type(maxLossInput, "25");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(updateSettings).toHaveBeenCalledWith({
        soilingLossPerDayPct: 0.3,
        maxSoilingLossPct: 25,
      })
    );
    expect(await screen.findByText("Parâmetros salvos.")).toBeInTheDocument();
  });

  it("mostra erro se a mutation falhar", async () => {
    useCalculationSettingsMock.mockReturnValue({
      soilingLossPerDayPct: 0.3,
      maxSoilingLossPct: 15,
    });
    useUpdateCalculationSettingsMock.mockReturnValue(
      asUpdateSettings(vi.fn().mockRejectedValue(new Error("fail")))
    );
    const user = userEvent.setup();
    render(<CalculationSettingsForm />);

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("Não foi possível salvar. Tente novamente.")).toBeInTheDocument();
  });
});
