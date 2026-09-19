import { v } from "convex/values";
import { createAccount } from "@convex-dev/auth/server";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { generateToken } from "./lib/tokens";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * `npx convex run invites:create '{"email":"prospect@empresa.com"}'` — gera
 * o convite e devolve o token; monte o link como
 * `<origem>/convite/<token>`. Não há UI/admin panel pra isso ainda: só o
 * time da Solyo (via CLI) cria convites.
 */
export const create = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const token = generateToken();
    await ctx.db.insert("invites", {
      email,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + INVITE_TTL_MS,
    });
    return { token };
  },
});

type InviteStatus =
  | { valid: true; email: string }
  | { valid: false; reason: "not_found" | "used" | "expired" };

/** Consumida por /convite/[token] pra decidir o que mostrar — pública, sem auth. */
export const getStatus = query({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<InviteStatus> => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!invite) return { valid: false, reason: "not_found" };
    if (invite.usedAt !== undefined) return { valid: false, reason: "used" };
    if (invite.expiresAt < Date.now()) return { valid: false, reason: "expired" };

    return { valid: true, email: invite.email };
  },
});

export const getValidInviteInternal = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<Doc<"invites"> | null> => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!invite || invite.usedAt !== undefined || invite.expiresAt < Date.now()) return null;
    return invite;
  },
});

export const markUsed = internalMutation({
  args: { token: v.string(), authId: v.id("users") },
  handler: async (ctx, { token, authId }) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!invite) return;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_authId", (q) => q.eq("authId", authId))
      .unique();

    await ctx.db.patch(invite._id, { usedAt: Date.now(), usedByProfileId: profile?._id });
  },
});

/**
 * Cria a conta de integrador a partir de um convite válido. Pública (sem
 * auth — é assim que o convidado ainda-sem-conta chega até aqui), mas só
 * funciona com um token de convite não usado e não expirado.
 */
export const accept = action({
  args: { token: v.string(), name: v.string(), password: v.string() },
  handler: async (ctx, { token, name, password }): Promise<{ email: string }> => {
    const invite = await ctx.runQuery(internal.invites.getValidInviteInternal, { token });
    if (!invite) throw new Error("Convite inválido ou expirado.");

    const { user } = await createAccount(ctx, {
      provider: "password",
      account: { id: invite.email, secret: password },
      profile: { email: invite.email, name },
    });

    await ctx.runMutation(internal.invites.markUsed, { token, authId: user._id });

    return { email: invite.email };
  },
});
