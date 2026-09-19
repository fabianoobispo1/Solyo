import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { assertSameTenant, requireTenant } from "./lib/tenant";
import { generatePortalToken } from "./lib/tokens";
import { getSoilingParams } from "./settings";
import {
  applySoiling,
  applySoilingToSeries,
  buildDailyGeneration,
  estimateCo2AvoidedKg,
  estimateMonthToDateKwh,
  estimateSavingsBRL,
  formatChangeVsAverage,
  soilingFactor,
  SoilingParams,
} from "./lib/generation";

const statusValidator = v.union(
  v.literal("online"),
  v.literal("alert"),
  v.literal("offline"),
  v.literal("inactive")
);

/** Shape consumido por src/lib/mock-data.ts::Client — não altere sem checar as páginas. */
function toClientDTO(plant: Doc<"plants">, soilingParams: SoilingParams) {
  const factor = soilingFactor(plant.lastCleaningAt, soilingParams);
  return {
    id: plant._id,
    slug: plant.portalToken,
    name: plant.ownerName,
    plant: plant.name,
    city: plant.city,
    kwp: plant.capacityKwp,
    generationKwh: applySoiling(estimateMonthToDateKwh(plant.capacityKwp, plant._id), factor),
    status: plant.status,
    alert: plant.alert,
    lastCleaningAt: plant.lastCleaningAt ?? null,
  };
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "";
  return `${first}${last}`.toUpperCase();
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await requireTenant(ctx);
    const soilingParams = await getSoilingParams(ctx, tenant._id);
    const plants = await ctx.db
      .query("plants")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
      .collect();
    return plants.map((plant) => toClientDTO(plant, soilingParams));
  },
});

export const get = query({
  args: { plantId: v.id("plants") },
  handler: async (ctx, { plantId }) => {
    const tenant = await requireTenant(ctx);
    const plant = await ctx.db.get(plantId);
    if (!plant) return null;
    assertSameTenant(tenant._id, plant.tenantId);
    const soilingParams = await getSoilingParams(ctx, tenant._id);
    return toClientDTO(plant, soilingParams);
  },
});

/** Shape consumido por src/lib/mock-data.ts::DashboardKpis. */
export const kpis = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await requireTenant(ctx);
    const soilingParams = await getSoilingParams(ctx, tenant._id);
    const plants = await ctx.db
      .query("plants")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
      .collect();

    const totalGenerationKwh = plants.reduce((sum, plant) => {
      const factor = soilingFactor(plant.lastCleaningAt, soilingParams);
      return sum + applySoiling(estimateMonthToDateKwh(plant.capacityKwp, plant._id), factor);
    }, 0);
    const openAlerts = plants.filter(
      (plant) => plant.status === "alert" || plant.status === "offline"
    ).length;

    return {
      activeClients: plants.length,
      totalGenerationKwh,
      monthlySavingsBRL: estimateSavingsBRL(totalGenerationKwh),
      openAlerts,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    ownerName: v.string(),
    city: v.string(),
    capacityKwp: v.number(),
  },
  handler: async (ctx, args) => {
    const tenant = await requireTenant(ctx);
    const portalToken = generatePortalToken();

    const plantId: Id<"plants"> = await ctx.db.insert("plants", {
      tenantId: tenant._id,
      clientProfileId: null,
      name: args.name,
      ownerName: args.ownerName,
      city: args.city,
      capacityKwp: args.capacityKwp,
      portalToken,
      status: "online",
      createdAt: Date.now(),
    });

    return { plantId, portalToken };
  },
});

export const update = mutation({
  args: {
    plantId: v.id("plants"),
    name: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    city: v.optional(v.string()),
    capacityKwp: v.optional(v.number()),
    status: v.optional(statusValidator),
    alert: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { plantId, alert, ...rest }) => {
    const tenant = await requireTenant(ctx);
    const plant = await ctx.db.get(plantId);
    if (!plant) throw new Error("Cliente não encontrado.");
    assertSameTenant(tenant._id, plant.tenantId);

    await ctx.db.patch(plantId, {
      ...rest,
      ...(alert !== undefined ? { alert: alert ?? undefined } : {}),
    });
  },
});

/**
 * Rota PÚBLICA (/c/[token]) — sem auth, de propósito. Resolve só os dados
 * daquela usina; nunca devolve nada sobre outras usinas do mesmo tenant.
 */
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const plant = await ctx.db
      .query("plants")
      .withIndex("by_portalToken", (q) => q.eq("portalToken", token))
      .unique();
    if (!plant) return null;

    const tenant = await ctx.db.get(plant.tenantId);
    const tenantName = tenant?.name ?? "Solyo";

    const soilingParams = await getSoilingParams(ctx, plant.tenantId);
    const factor = soilingFactor(plant.lastCleaningAt, soilingParams);
    const dailyGeneration = applySoilingToSeries(
      buildDailyGeneration(plant.capacityKwp, plant._id),
      factor
    );
    const todayGenerationKwh = dailyGeneration[dailyGeneration.length - 1].kwh;
    const monthToDateKwh = applySoiling(
      estimateMonthToDateKwh(plant.capacityKwp, plant._id),
      factor
    );

    return {
      slug: plant.portalToken,
      clientName: plant.ownerName,
      city: plant.city,
      plant: plant.name,
      status: plant.status,
      todayGenerationKwh,
      changeVsAverage: formatChangeVsAverage(dailyGeneration),
      accumulatedSavingsBRL: estimateSavingsBRL(monthToDateKwh),
      co2AvoidedKg: estimateCo2AvoidedKg(monthToDateKwh),
      dailyGeneration,
      lastCleaningAt: plant.lastCleaningAt ?? null,
      integrator: {
        slug: plant.tenantId,
        name: tenantName,
        logoInitials: initialsFromName(tenantName),
        primaryHex: "#0C5A46",
      },
    };
  },
});

/**
 * Rota PÚBLICA (/c/[token]) — sem auth, de propósito, mesma lógica de acesso
 * de `getByToken`: o token em si (128 bits, não-adivinhável) é quem
 * autoriza. É assim que o cliente final registra a própria limpeza dos
 * painéis, sem precisar de login (ver docs/portal-cliente.md).
 */
export const updateLastCleaning = mutation({
  args: { token: v.string(), lastCleaningAt: v.number() },
  handler: async (ctx, { token, lastCleaningAt }) => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (lastCleaningAt > Date.now() + oneDayMs) {
      throw new Error("Data de limpeza não pode ser no futuro.");
    }

    const plant = await ctx.db
      .query("plants")
      .withIndex("by_portalToken", (q) => q.eq("portalToken", token))
      .unique();
    if (!plant) throw new Error("Portal não encontrado.");

    await ctx.db.patch(plant._id, { lastCleaningAt });
  },
});
