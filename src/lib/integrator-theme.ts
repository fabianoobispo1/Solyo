/**
 * Modela o white-label descrito em DESIGN.md §5. Em produção isso viria de um
 * middleware/DB (lookup por slug do integrador); aqui é um mock em memória.
 */
export interface IntegratorTheme {
  slug: string;
  name: string;
  logoInitials: string;
  /** Substitui #0C5A46 nas barras e glows do portal. Solyo mantém #F2A422 e #040C18 fixos. */
  primaryHex: string;
}

const mockIntegratorThemes: Record<string, IntegratorTheme> = {
  "energia-solar-rs": {
    slug: "energia-solar-rs",
    name: "EnergiaSolar RS",
    logoInitials: "ES",
    primaryHex: "#0C5A46",
  },
  "sol-nordeste": {
    slug: "sol-nordeste",
    name: "Sol Nordeste Energia",
    logoInitials: "SN",
    primaryHex: "#B45309",
  },
};

export function getIntegratorTheme(slug: string): IntegratorTheme | undefined {
  return mockIntegratorThemes[slug];
}
