import { v } from "convex/values";
import { modifyAccountCredentials } from "@convex-dev/auth/server";
import { internalAction } from "./_generated/server";

/**
 * `npx convex run admin:resetPassword '{"email":"...","newPassword":"..."}'`
 * — troca a senha de uma conta de integrador já existente. `internalAction`
 * de propósito: só roda via CLI (acesso ao deployment), nunca exposta a
 * clientes — não tem nenhuma verificação de identidade além dessa.
 */
export const resetPassword = internalAction({
  args: { email: v.string(), newPassword: v.string() },
  handler: async (ctx, { email, newPassword }) => {
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: email, secret: newPassword },
    });
  },
});
