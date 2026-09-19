/** Token genérico não-adivinhável (32 chars hex) — usado em /c/[token] e /convite/[token]. */
export function generateToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Token não-adivinhável usado na rota pública /c/[token]. */
export const generatePortalToken = generateToken;
