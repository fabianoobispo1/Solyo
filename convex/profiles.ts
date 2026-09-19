import { query } from "./_generated/server";
import { requireUser } from "./lib/tenant";

/** Perfil do usuário autenticado — hoje só integrador_admin usa isto. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireUser(ctx);
    return { name: profile.name, email: profile.email, role: profile.role };
  },
});
