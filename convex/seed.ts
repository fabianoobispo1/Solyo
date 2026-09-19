import { v } from "convex/values";
import { createAccount } from "@convex-dev/auth/server";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { generatePortalToken } from "./lib/tokens";

const DEMO_EMAIL = "contato@aurorasolar.com.br";
const DEMO_PASSWORD = "AuroraSolar#2026";
const DEMO_TENANT_NAME = "Aurora Solar";

const DEMO_PLANTS = [
  {
    name: "Sítio Recanto das Águas",
    ownerName: "Renata Souza",
    city: "Uberlândia, MG",
    capacityKwp: 6.2,
  },
  {
    name: "Padaria Pão Dourado",
    ownerName: "Padaria Pão Dourado",
    city: "Belo Horizonte, MG",
    capacityKwp: 9.8,
  },
  {
    name: "Residência Vila Bela",
    ownerName: "Carlos Eduardo Lima",
    city: "Juiz de Fora, MG",
    capacityKwp: 4.5,
  },
  {
    name: "Granja Boa Esperança",
    ownerName: "Granja Boa Esperança",
    city: "Uberaba, MG",
    capacityKwp: 15.4,
  },
] as const;

export const findProfileByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const attachDemoPlants = internalMutation({
  args: { authId: v.id("users") },
  handler: async (ctx, { authId }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_authId", (q) => q.eq("authId", authId))
      .unique();
    if (!profile) {
      throw new Error("Profile não encontrado logo após criar a conta de demonstração.");
    }

    for (const plant of DEMO_PLANTS) {
      await ctx.db.insert("plants", {
        tenantId: profile._id,
        clientProfileId: null,
        name: plant.name,
        ownerName: plant.ownerName,
        city: plant.city,
        capacityKwp: plant.capacityKwp,
        portalToken: generatePortalToken(),
        status: "online",
        createdAt: Date.now(),
      });
    }

    return profile._id;
  },
});

/**
 * `npx convex run seed:seedDemoTenant` — cria o tenant de demonstração
 * "Aurora Solar" (login por e-mail/senha) com 3–4 clientes de MG, pra o
 * app já subir povoado. Idempotente: roda de novo sem duplicar nada.
 */
export const seedDemoTenant = internalAction({
  args: {},
  handler: async (ctx): Promise<{ email: string; password: string; skipped: boolean }> => {
    const existingProfile = await ctx.runQuery(internal.seed.findProfileByEmail, {
      email: DEMO_EMAIL,
    });
    if (existingProfile) {
      return { email: DEMO_EMAIL, password: DEMO_PASSWORD, skipped: true };
    }

    const { user } = await createAccount(ctx, {
      provider: "password",
      account: { id: DEMO_EMAIL, secret: DEMO_PASSWORD },
      profile: { email: DEMO_EMAIL, name: DEMO_TENANT_NAME },
    });

    await ctx.runMutation(internal.seed.attachDemoPlants, { authId: user._id });

    return { email: DEMO_EMAIL, password: DEMO_PASSWORD, skipped: false };
  },
});
