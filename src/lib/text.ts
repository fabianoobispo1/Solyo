/** Remove acentos e caixa pra comparação de busca tolerante (ex: "uberlandia" ~ "Uberlândia"). */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
