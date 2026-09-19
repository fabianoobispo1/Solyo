import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { GenericMutationCtx } from "convex/server";
import { isSuperAdminEmail } from "./lib/admin";
import { Id } from "./_generated/dataModel";
import type { DataModel } from "./_generated/dataModel";

async function createIntegradorProfile(
  ctx: GenericMutationCtx<DataModel>,
  authId: Id<"users">,
  name: string,
  email: string
) {
  await ctx.db.insert("profiles", { authId, role: "integrador_admin", name, email });
}

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
    // Só entra quem já tem conta (criada por convite) — ver createOrUpdateUser.
    Google({
      profile(google) {
        if (!google.email_verified) throw new Error("E-mail do Google não verificado.");
        return {
          id: google.sub,
          email: google.email,
          name: google.name,
          image: google.picture,
        };
      },
    }),
  ],
  callbacks: {
    // Substitui o comportamento padrão pra manter o cadastro fechado. Login
    // com Google só entra direto se já existe usuário com o mesmo e-mail
    // (criado via convite) ou se é o super admin. Qualquer outro vira um
    // usuário SEM profile + um `accessRequest` pendente, que o super admin
    // aprova em /admin/acessos (convex/accessRequests.ts). Sem isso, qualquer
    // conta Google viraria um "integrador_admin" novo.
    async createOrUpdateUser(ctx, { existingUserId, provider, profile }) {
      if (existingUserId) return existingUserId;

      const email = typeof profile.email === "string" ? profile.email : "";
      const name = typeof profile.name === "string" && profile.name.length > 0 ? profile.name : email;

      if (provider.id === "google") {
        const user = email
          ? await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("email"), email))
              .first()
          : null;
        if (user) {
          await ctx.db.patch(user._id, { emailVerificationTime: Date.now() });
          return user._id;
        }

        const userId = await ctx.db.insert("users", {
          email,
          name: profile.name,
          image: profile.image,
          emailVerificationTime: Date.now(),
        });

        if (isSuperAdminEmail(email)) {
          await createIntegradorProfile(ctx, userId, name, email);
        } else {
          await ctx.db.insert("accessRequests", {
            authId: userId,
            email,
            name,
            image: typeof profile.image === "string" ? profile.image : undefined,
            status: "pending",
            createdAt: Date.now(),
          });
        }
        return userId;
      }

      const userData = { ...profile };
      delete userData.emailVerified;
      delete userData.phoneVerified;
      const userId = await ctx.db.insert("users", userData);

      // Só o integrador loga neste MVP (ver DESIGN.md/roadmap) — todo novo
      // usuário de auth vira automaticamente um profile "integrador_admin",
      // que também funciona como o tenant dos `plants` que ele cadastrar.
      // (Com `createOrUpdateUser` customizado o `afterUserCreatedOrUpdated`
      // não roda, por isso isso vive aqui.)
      await createIntegradorProfile(ctx, userId, name, email);
      return userId;
    },
  },
});
