import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { isSuperAdmin } from "./lib/admin";

/**
 * Perfil do usuário autenticado. `null` quando não há profile — ex: quem
 * entrou com Google e ainda aguarda aprovação (ver convex/accessRequests.ts).
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const authId = await getAuthUserId(ctx);
    if (!authId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_authId", (q) => q.eq("authId", authId))
      .unique();
    if (!profile) return null;

    return {
      name: profile.name,
      email: profile.email,
      role: profile.role,
      isSuperAdmin: isSuperAdmin(profile),
    };
  },
});
