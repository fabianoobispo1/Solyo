import { Doc } from "../_generated/dataModel";

/**
 * Conta que administra a plataforma: aprova/recusa quem pede acesso via
 * Google (ver convex/accessRequests.ts). Fixo no código de propósito — não
 * depende de env var e não dá pra "virar super admin" por configuração de
 * banco; trocar de dono exige um deploy.
 */
export const SUPER_ADMIN_EMAIL = "fbc623@gmail.com";

export function isSuperAdminEmail(email: string | undefined | null): boolean {
  return !!email && email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

export function isSuperAdmin(profile: Doc<"profiles">): boolean {
  return isSuperAdminEmail(profile.email);
}
