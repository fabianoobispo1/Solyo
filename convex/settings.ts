import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireTenant } from "./lib/tenant";
import { DEFAULT_SOILING_PARAMS, SoilingParams } from "./lib/generation";

/**
 * Resolve os parâmetros de sujeira do tenant, com fallback pros padrões
 * quando ele nunca configurou nada — usado por convex/plants.ts (autenticado
 * ou não, por isso recebe o `tenantId` já resolvido em vez de chamar
 * `requireTenant`).
 */
export async function getSoilingParams(
  ctx: QueryCtx | MutationCtx,
  tenantId: Id<"profiles">
): Promise<SoilingParams> {
  const settings = await ctx.db
    .query("tenantSettings")
    .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
    .unique();

  return {
    lossPerDayPct: settings?.soilingLossPerDayPct ?? DEFAULT_SOILING_PARAMS.lossPerDayPct,
    maxLossPct: settings?.maxSoilingLossPct ?? DEFAULT_SOILING_PARAMS.maxLossPct,
  };
}

/** Shape consumido por src/app/(integrador)/configuracoes/page.tsx. */
export const getCalculationSettings = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await requireTenant(ctx);
    const params = await getSoilingParams(ctx, tenant._id);
    return {
      soilingLossPerDayPct: params.lossPerDayPct,
      maxSoilingLossPct: params.maxLossPct,
    };
  },
});

export const updateCalculationSettings = mutation({
  args: {
    soilingLossPerDayPct: v.number(),
    maxSoilingLossPct: v.number(),
  },
  handler: async (ctx, args) => {
    const tenant = await requireTenant(ctx);

    if (args.soilingLossPerDayPct < 0 || args.maxSoilingLossPct < 0) {
      throw new Error("Os parâmetros de cálculo não podem ser negativos.");
    }

    const existing = await ctx.db
      .query("tenantSettings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("tenantSettings", { tenantId: tenant._id, ...args });
    }
  },
});
