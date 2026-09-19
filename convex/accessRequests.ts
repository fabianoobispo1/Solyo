import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { isSuperAdmin } from "./lib/admin";
import { requireUser, TenantError } from "./lib/tenant";

async function getProfile(ctx: QueryCtx | MutationCtx): Promise<Doc<"profiles"> | null> {
  const authId = await getAuthUserId(ctx);
  if (!authId) return null;
  return await ctx.db
    .query("profiles")
    .withIndex("by_authId", (q) => q.eq("authId", authId))
    .unique();
}

async function requireSuperAdmin(ctx: QueryCtx | MutationCtx): Promise<Doc<"profiles">> {
  const profile = await requireUser(ctx);
  if (!isSuperAdmin(profile)) throw new TenantError("Acesso negado: só o super admin.");
  return profile;
}

/**
 * Estado da solicitação de acesso do usuário logado — consumida por
 * /acesso-pendente. Não exige profile (quem chega lá ainda não tem).
 */
export const myRequest = query({
  args: {},
  handler: async (ctx) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) return null;

    const request = await ctx.db
      .query("accessRequests")
      .withIndex("by_authId", (q) => q.eq("authId", authId))
      .unique();
    if (!request) return null;

    return { status: request.status, email: request.email, name: request.name };
  },
});

/** Lista pra tela do super admin. `null` pra qualquer outro usuário (sem erro, pra não quebrar a UI). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const profile = await getProfile(ctx);
    if (!profile || !isSuperAdmin(profile)) return null;

    const requests = await ctx.db.query("accessRequests").collect();
    return requests
      .sort((a, b) => {
        if ((a.status === "pending") !== (b.status === "pending")) return a.status === "pending" ? -1 : 1;
        return b.createdAt - a.createdAt;
      })
      .map((r) => ({
        id: r._id,
        email: r.email,
        name: r.name,
        image: r.image,
        status: r.status,
        createdAt: r.createdAt,
      }));
  },
});

export const decide = mutation({
  args: { requestId: v.id("accessRequests"), approve: v.boolean() },
  handler: async (ctx, { requestId, approve }) => {
    const admin = await requireSuperAdmin(ctx);

    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Solicitação não encontrada.");

    if (approve) {
      const existing = await ctx.db
        .query("profiles")
        .withIndex("by_authId", (q) => q.eq("authId", request.authId))
        .unique();
      if (!existing) {
        await ctx.db.insert("profiles", {
          authId: request.authId,
          role: "integrador_admin",
          name: request.name || request.email,
          email: request.email,
        });
      }
    }

    await ctx.db.patch(requestId, {
      status: approve ? "approved" : "rejected",
      decidedAt: Date.now(),
      decidedBy: admin._id,
    });
  },
});
