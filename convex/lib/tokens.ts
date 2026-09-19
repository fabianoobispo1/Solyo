/** Token não-adivinhável usado na rota pública /c/[token]. */
export function generatePortalToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
