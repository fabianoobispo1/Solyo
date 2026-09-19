import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: (params.name as string) ?? "",
        };
      },
    }),
  ],
  callbacks: {
    // Só o integrador loga neste MVP (ver DESIGN.md/roadmap) — todo novo
    // usuário de auth vira automaticamente um profile "integrador_admin",
    // que também funciona como o tenant dos `plants` que ele cadastrar.
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId, profile }) {
      if (existingUserId) return;

      const existingProfile = await ctx.db
        .query("profiles")
        .filter((q) => q.eq(q.field("authId"), userId))
        .first();
      if (existingProfile) return;

      const email = typeof profile.email === "string" ? profile.email : "";
      const name = typeof profile.name === "string" && profile.name.length > 0 ? profile.name : email;

      await ctx.db.insert("profiles", {
        authId: userId,
        role: "integrador_admin",
        name,
        email,
      });
    },
  },
});
