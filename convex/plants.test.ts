import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

/**
 * Cria um "integrador" de teste sem passar pelo fluxo completo de senha do
 * Convex Auth: insere a `users` row + o `profile` direto no banco e devolve
 * um cliente já autenticado como esse usuário (via `t.withIdentity`, que
 * simula o retorno de `ctx.auth.getUserIdentity()` — é exatamente o que
 * `getAuthUserId` em convex/lib/tenant.ts lê para achar o profile).
 */
async function createIntegrador(t: ReturnType<typeof convexTest>, name: string, email: string) {
  const userId = await t.run(async (ctx) => ctx.db.insert("users", {}));
  await t.run(async (ctx) =>
    ctx.db.insert("profiles", { authId: userId, role: "integrador_admin", name, email })
  );

  return t.withIdentity({ subject: `${userId}|test-session` });
}

describe("isolamento entre tenants (convex/lib/tenant.ts)", () => {
  it("um integrador nunca vê plants de outro na própria listagem", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");
    const bob = await createIntegrador(t, "Bob", "bob@example.com");

    await alice.mutation(api.plants.create, {
      name: "Usina da Alice",
      ownerName: "Cliente da Alice",
      city: "Porto Alegre, RS",
      capacityKwp: 5.4,
    });

    const bobList = await bob.query(api.plants.list, {});
    expect(bobList).toHaveLength(0);

    const aliceList = await alice.query(api.plants.list, {});
    expect(aliceList).toHaveLength(1);
    expect(aliceList[0].city).toBe("Porto Alegre, RS");
  });

  it("um integrador não consegue LER a plant de outro pelo id", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");
    const bob = await createIntegrador(t, "Bob", "bob@example.com");

    const { plantId } = await alice.mutation(api.plants.create, {
      name: "Usina da Alice",
      ownerName: "Cliente da Alice",
      city: "Porto Alegre, RS",
      capacityKwp: 5.4,
    });

    await expect(bob.query(api.plants.get, { plantId })).rejects.toThrow(/outro integrador/);

    // A própria dona continua conseguindo ler normalmente.
    const own = await alice.query(api.plants.get, { plantId });
    expect(own?.name).toBe("Cliente da Alice");
  });

  it("um integrador não consegue EDITAR a plant de outro", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");
    const bob = await createIntegrador(t, "Bob", "bob@example.com");

    const { plantId } = await alice.mutation(api.plants.create, {
      name: "Usina da Alice",
      ownerName: "Cliente da Alice",
      city: "Porto Alegre, RS",
      capacityKwp: 5.4,
    });

    await expect(
      bob.mutation(api.plants.update, { plantId, city: "Cidade invadida" })
    ).rejects.toThrow(/outro integrador/);

    const untouched = await alice.query(api.plants.get, { plantId });
    expect(untouched?.city).toBe("Porto Alegre, RS");
  });

  it("os KPIs de um tenant não contam plants de outro", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");
    const bob = await createIntegrador(t, "Bob", "bob@example.com");

    await alice.mutation(api.plants.create, {
      name: "Usina 1",
      ownerName: "Cliente 1",
      city: "Porto Alegre, RS",
      capacityKwp: 5,
    });
    await alice.mutation(api.plants.create, {
      name: "Usina 2",
      ownerName: "Cliente 2",
      city: "Caxias do Sul, RS",
      capacityKwp: 8,
    });

    const bobKpis = await bob.query(api.plants.kpis, {});
    expect(bobKpis.activeClients).toBe(0);
    expect(bobKpis.totalGenerationKwh).toBe(0);

    const aliceKpis = await alice.query(api.plants.kpis, {});
    expect(aliceKpis.activeClients).toBe(2);
  });
});

describe("acesso sem autenticação", () => {
  it("list/kpis/create/update exigem login", async () => {
    const t = convexTest(schema);

    await expect(t.query(api.plants.list, {})).rejects.toThrow(/[Nn]ão autenticado/);
    await expect(t.query(api.plants.kpis, {})).rejects.toThrow(/[Nn]ão autenticado/);
    await expect(
      t.mutation(api.plants.create, {
        name: "x",
        ownerName: "y",
        city: "z",
        capacityKwp: 1,
      })
    ).rejects.toThrow(/[Nn]ão autenticado/);
  });
});

describe("rota pública /c/[token] (convex/plants.ts::getByToken)", () => {
  it("resolve os dados públicos daquela usina pelo token", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");

    const { portalToken } = await alice.mutation(api.plants.create, {
      name: "Residência Jardim Europa",
      ownerName: "Marcos Andrade",
      city: "Porto Alegre, RS",
      capacityKwp: 5.4,
    });

    const publicView = await t.query(api.plants.getByToken, { token: portalToken });
    expect(publicView).not.toBeNull();
    expect(publicView?.clientName).toBe("Marcos Andrade");
    expect(publicView?.plant).toBe("Residência Jardim Europa");
    expect(publicView?.dailyGeneration).toHaveLength(14);
    expect(publicView?.integrator.name).toBe("Alice");
  });

  it("não vaza dados de outras usinas do mesmo tenant", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");

    const { portalToken: tokenA } = await alice.mutation(api.plants.create, {
      name: "Usina A",
      ownerName: "Cliente A",
      city: "Porto Alegre, RS",
      capacityKwp: 5,
    });
    await alice.mutation(api.plants.create, {
      name: "Usina B",
      ownerName: "Cliente B",
      city: "Caxias do Sul, RS",
      capacityKwp: 8,
    });

    const publicView = await t.query(api.plants.getByToken, { token: tokenA });
    expect(publicView?.clientName).toBe("Cliente A");
  });

  it("devolve null para um token que não existe — sem autenticação exigida", async () => {
    const t = convexTest(schema);
    const result = await t.query(api.plants.getByToken, { token: "token-que-nao-existe" });
    expect(result).toBeNull();
  });
});

describe("última limpeza e o efeito de sujeira na geração", () => {
  it("uma usina sem limpeza registrada devolve lastCleaningAt null", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");

    const { portalToken } = await alice.mutation(api.plants.create, {
      name: "Usina",
      ownerName: "Cliente",
      city: "Porto Alegre, RS",
      capacityKwp: 5.4,
    });

    const publicView = await t.query(api.plants.getByToken, { token: portalToken });
    expect(publicView?.lastCleaningAt).toBeNull();

    const list = await alice.query(api.plants.list, {});
    expect(list[0].lastCleaningAt).toBeNull();
  });

  it("o cliente final registra a limpeza pelo token, sem precisar de login", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");

    const { portalToken } = await alice.mutation(api.plants.create, {
      name: "Usina",
      ownerName: "Cliente",
      city: "Porto Alegre, RS",
      capacityKwp: 5.4,
    });

    const cleanedAt = Date.now();
    await t.mutation(api.plants.updateLastCleaning, { token: portalToken, lastCleaningAt: cleanedAt });

    const publicView = await t.query(api.plants.getByToken, { token: portalToken });
    expect(publicView?.lastCleaningAt).toBe(cleanedAt);
  });

  it("rejeita registrar uma limpeza no futuro", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");

    const { portalToken } = await alice.mutation(api.plants.create, {
      name: "Usina",
      ownerName: "Cliente",
      city: "Porto Alegre, RS",
      capacityKwp: 5.4,
    });

    const nextYear = Date.now() + 365 * 24 * 60 * 60 * 1000;
    await expect(
      t.mutation(api.plants.updateLastCleaning, { token: portalToken, lastCleaningAt: nextYear })
    ).rejects.toThrow(/futuro/);
  });

  it("rejeita um token que não existe", async () => {
    const t = convexTest(schema);
    await expect(
      t.mutation(api.plants.updateLastCleaning, {
        token: "token-que-nao-existe",
        lastCleaningAt: Date.now(),
      })
    ).rejects.toThrow(/[Nn]ão encontrado/);
  });

  it("sujeira acumulada reduz a geração — mais dias sem limpeza, menos kWh", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");

    const { portalToken } = await alice.mutation(api.plants.create, {
      name: "Usina",
      ownerName: "Cliente",
      city: "Porto Alegre, RS",
      capacityKwp: 5.4,
    });

    // Parâmetro de perda bem alto (10%/dia) só pra tornar o efeito visível
    // com poucos dias, sem depender do valor default de produção.
    await alice.mutation(api.settings.updateCalculationSettings, {
      soilingLossPerDayPct: 10,
      maxSoilingLossPct: 90,
    });

    const cleanedRecently = Date.now() - 1 * 24 * 60 * 60 * 1000;
    const cleanedLongAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;

    await t.mutation(api.plants.updateLastCleaning, {
      token: portalToken,
      lastCleaningAt: cleanedRecently,
    });
    const recentView = await t.query(api.plants.getByToken, { token: portalToken });

    await t.mutation(api.plants.updateLastCleaning, {
      token: portalToken,
      lastCleaningAt: cleanedLongAgo,
    });
    const oldView = await t.query(api.plants.getByToken, { token: portalToken });

    expect(oldView!.todayGenerationKwh).toBeLessThan(recentView!.todayGenerationKwh);
  });
});

describe("convex/settings.ts — parâmetros de cálculo por tenant", () => {
  it("sem configuração salva, devolve os padrões", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");

    const settings = await alice.query(api.settings.getCalculationSettings, {});
    expect(settings.soilingLossPerDayPct).toBeGreaterThan(0);
    expect(settings.maxSoilingLossPct).toBeGreaterThan(0);
  });

  it("salva e devolve os parâmetros customizados do tenant", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");

    await alice.mutation(api.settings.updateCalculationSettings, {
      soilingLossPerDayPct: 0.5,
      maxSoilingLossPct: 25,
    });

    const settings = await alice.query(api.settings.getCalculationSettings, {});
    expect(settings).toEqual({ soilingLossPerDayPct: 0.5, maxSoilingLossPct: 25 });
  });

  it("rejeita parâmetros negativos", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");

    await expect(
      alice.mutation(api.settings.updateCalculationSettings, {
        soilingLossPerDayPct: -1,
        maxSoilingLossPct: 10,
      })
    ).rejects.toThrow(/negativ/);
  });

  it("os parâmetros de um tenant não vazam nem afetam o outro", async () => {
    const t = convexTest(schema);
    const alice = await createIntegrador(t, "Alice", "alice@example.com");
    const bob = await createIntegrador(t, "Bob", "bob@example.com");

    await alice.mutation(api.settings.updateCalculationSettings, {
      soilingLossPerDayPct: 5,
      maxSoilingLossPct: 50,
    });

    const bobSettings = await bob.query(api.settings.getCalculationSettings, {});
    expect(bobSettings.soilingLossPerDayPct).not.toBe(5);
  });

  it("exige login", async () => {
    const t = convexTest(schema);
    await expect(t.query(api.settings.getCalculationSettings, {})).rejects.toThrow(
      /[Nn]ão autenticado/
    );
  });
});
