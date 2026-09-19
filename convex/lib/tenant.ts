import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Isolamento entre tenants é inegociável neste app: nenhuma query/mutation
 * que leia ou escreva dado de um `plant` pode pular por `requireTenant` +
 * `assertSameTenant`. Um integrador nunca deve conseguir ver ou alterar
 * dado de outro.
 */

export class TenantError extends Error {}

/** Exige um usuário de auth válido e devolve o `profile` correspondente. */
export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"profiles">> {
  const authId = await getAuthUserId(ctx);
  if (!authId) throw new TenantError("Não autenticado.");

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_authId", (q) => q.eq("authId", authId))
    .unique();
  if (!profile) throw new TenantError("Perfil não encontrado para este usuário.");

  return profile;
}

/**
 * Exige um usuário autenticado com papel `integrador_admin` e devolve seu
 * `profile` — que também é o tenant (ver convex/schema.ts: "Integrador =
 * tenant" neste MVP, então `profile._id` é o `tenantId` usado em `plants`).
 */
export async function requireTenant(ctx: QueryCtx | MutationCtx): Promise<Doc<"profiles">> {
  const profile = await requireUser(ctx);
  assertRole(profile, "integrador_admin");
  return profile;
}

export function assertRole(
  profile: Doc<"profiles">,
  role: Doc<"profiles">["role"]
): void {
  if (profile.role !== role) {
    throw new TenantError(`Acesso negado: esta ação exige o papel "${role}".`);
  }
}

/** Garante que um recurso (`plant.tenantId`, por ex.) pertence ao tenant autenticado. */
export function assertSameTenant(
  tenantId: Id<"profiles">,
  resourceTenantId: Id<"profiles">
): void {
  if (tenantId !== resourceTenantId) {
    throw new TenantError("Acesso negado: este recurso pertence a outro integrador.");
  }
}
