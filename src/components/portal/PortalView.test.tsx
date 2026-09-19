// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PortalView } from "./PortalView";
import type { ClientPortalData } from "@/lib/mock-portal";

const basePortal: ClientPortalData = {
  slug: "abc123",
  clientName: "Marcos Andrade",
  city: "Porto Alegre, RS",
  plant: "Residência Jardim Europa",
  status: "online",
  todayGenerationKwh: 892,
  changeVsAverage: "+12% vs. média",
  accumulatedSavingsBRL: 7820,
  co2AvoidedKg: 628,
  dailyGeneration: [{ day: "18", kwh: 892, condition: "sunny" }],
  lastCleaningAt: null,
  integrator: {
    slug: "energia-solar-rs",
    name: "Energia Solar RS",
    logoInitials: "ES",
    primaryHex: "#0C5A46",
  },
};

describe("PortalView — última limpeza", () => {
  it('mostra "Ainda não registrada" quando lastCleaningAt é null', () => {
    render(<PortalView portal={basePortal} />);
    expect(screen.getByText(/Ainda não registrada/)).toBeInTheDocument();
  });

  it("mostra a data formatada quando lastCleaningAt está preenchido", () => {
    const lastCleaningAt = new Date("2026-01-15T00:00:00").getTime();
    render(<PortalView portal={{ ...basePortal, lastCleaningAt }} />);
    expect(screen.getByText(/Registrada em 15\/01\/2026/)).toBeInTheDocument();
  });

  it("sem onUpdateLastCleaning (demo /portal/[slug]), não mostra o formulário", () => {
    render(<PortalView portal={basePortal} />);
    expect(screen.queryByRole("button", { name: "Registrar limpeza" })).not.toBeInTheDocument();
  });

  it("com onUpdateLastCleaning, chama o callback com a data escolhida", async () => {
    const onUpdateLastCleaning = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PortalView portal={basePortal} onUpdateLastCleaning={onUpdateLastCleaning} />);

    const dateInput = screen.getByDisplayValue(
      new Date().toISOString().slice(0, 10)
    ) as HTMLInputElement;
    await user.clear(dateInput);
    await user.type(dateInput, "2026-01-10");

    await user.click(screen.getByRole("button", { name: "Registrar limpeza" }));

    await waitFor(() => expect(onUpdateLastCleaning).toHaveBeenCalledTimes(1));
    const calledWith = onUpdateLastCleaning.mock.calls[0][0];
    expect(new Date(calledWith).toISOString().slice(0, 10)).toBe("2026-01-10");
  });

  it("mostra erro se o callback falhar", async () => {
    const onUpdateLastCleaning = vi.fn().mockRejectedValue(new Error("fail"));
    const user = userEvent.setup();
    render(<PortalView portal={basePortal} onUpdateLastCleaning={onUpdateLastCleaning} />);

    await user.click(screen.getByRole("button", { name: "Registrar limpeza" }));

    expect(
      await screen.findByText("Não foi possível atualizar. Tente novamente.")
    ).toBeInTheDocument();
  });
});
