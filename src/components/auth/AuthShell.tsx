import { ReactNode } from "react";
import { SolvoLogo } from "@/components/ui/SolvoLogo";

export interface AuthShellProps {
  headline?: string;
  description?: string;
  children: ReactNode;
}

const DEFAULT_HEADLINE = "Gerencie sua carteira solar com clareza total";
const DEFAULT_DESCRIPTION =
  "Acompanhe geração, economia e alertas de todos os seus clientes em um só painel — e ofereça um portal white-label para cada um deles.";

/**
 * Painel de marca (gradiente escuro + glow orbs + textura de grid) usado em
 * `/login` e `/convite/[token]` — extraído pra não duplicar esse bloco
 * entre as duas telas de autenticação.
 */
export function AuthShell({
  headline = DEFAULT_HEADLINE,
  description = DEFAULT_DESCRIPTION,
  children,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <section
        className="relative flex w-full flex-col justify-between gap-10 overflow-hidden px-10 py-12 text-white lg:w-[560px] lg:shrink-0"
        style={{
          background: "linear-gradient(155deg, #081E14 0%, #0C5A46 50%, #062E22 100%)",
        }}
      >
        <GridTexture />
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(242,164,34,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(12,90,70,0.55), transparent 70%)" }}
        />

        <div className="relative z-10 flex flex-col gap-10">
          <SolvoLogo variant="dark" />
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[40px] font-bold leading-tight tracking-[-1px]">
              {headline}
            </h2>
            <p className="max-w-sm font-body text-sm text-white/60">{description}</p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          <Stat value="+2.400" label="clientes monitorados" />
          <Stat value="98%" label="uptime de geração" />
          <Stat value="R$4M" label="economizados" />
        </div>
      </section>

      <section className="flex w-full flex-1 items-center justify-center bg-neutral-surface px-6 py-16 sm:px-10">
        <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-display text-xl font-bold tracking-[-0.5px]">{value}</span>
      <span className="font-body text-[11px] text-white/50">{label}</span>
    </div>
  );
}

function GridTexture() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
      <defs>
        <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.5)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#auth-grid)" />
    </svg>
  );
}
