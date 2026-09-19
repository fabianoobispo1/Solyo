import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SolvoLogo } from "@/components/ui/SolvoLogo";
import { GlobeIcon, GridIcon, UsersIcon } from "@/components/layout/nav-icons";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Solyo — Painel para integradores solares",
  description:
    "Gerencie sua carteira de clientes solares, acompanhe geração e economia, e ofereça um portal para cada cliente final.",
};

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between px-6 sm:px-10">
        <SolvoLogo />
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-btn border border-brand-emerald px-4 font-body text-sm font-medium text-brand-emerald hover:bg-brand-emerald/5"
        >
          Entrar
        </Link>
      </header>

      <section
        className="relative overflow-hidden px-6 py-16 text-white sm:px-10 sm:py-24"
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

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="rounded-badge border border-white/10 bg-white/5 px-3 py-1 font-body text-xs font-medium text-white/70">
            Para integradores de energia solar
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-[-1px] sm:text-5xl sm:tracking-[-1.5px]">
            Sua carteira solar, com clareza total
          </h1>
          <p className="max-w-xl font-body text-base text-white/70 sm:text-lg">
            Acompanhe geração, economia e alertas de todos os seus clientes em
            um só painel — e ofereça um portal próprio para cada um deles,
            sem precisar programar nada.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/login" variant="amber">
              Entrar no painel
            </LinkButton>
            <LinkButton href="/portal/marcos-andrade" variant="neutral" target="_blank">
              Ver portal de exemplo
            </LinkButton>
          </div>

          <div className="mt-8 grid w-full max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-8">
            <Stat value="+2.400" label="clientes monitorados" />
            <Stat value="98%" label="uptime de geração" />
            <Stat value="R$4M" label="economizados" />
          </div>
        </div>
      </section>

      <section className="bg-neutral-bg px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="font-display text-2xl font-bold tracking-[-0.5px] text-neutral-heading sm:text-3xl">
              Tudo que você precisa pra operar
            </h2>
            <p className="font-body text-sm text-neutral-secondary sm:text-base">
              Do cadastro do cliente ao portal que ele acessa — sem depender
              de planilha.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={<GridIcon size={22} />}
              title="Painel do integrador"
              description="KPIs de geração, economia e alertas de todos os clientes, atualizados em tempo real."
            />
            <FeatureCard
              icon={<UsersIcon size={22} />}
              title="Cadastro em minutos"
              description="Adicione um cliente com nome, cidade e potência instalada — o resto o Solyo calcula."
            />
            <FeatureCard
              icon={<GlobeIcon size={22} />}
              title="Portal para cada cliente"
              description="Um link único e não-adivinhável pra cada cliente acompanhar a própria geração, sem precisar de login."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-border bg-neutral-surface px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="font-display text-2xl font-bold tracking-[-0.5px] text-neutral-heading sm:text-3xl">
              O painel que seu cliente já vê
            </h2>
            <p className="font-body text-sm text-neutral-secondary sm:text-base">
              Uma prévia de como fica a visão geral da sua carteira.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              variant="filled"
              label="Geração total (mês)"
              value="128.430 kWh"
              sub="mês corrente até hoje"
            />
            <KPICard label="Clientes ativos" value="248" sub="+18 este mês" />
            <KPICard label="Economia gerada" value="R$ 96.2k" sub="acumulado no mês" />
            <KPICard label="Alertas ativos" value="2" sub="requer atenção" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <StatusBadge status="online" label="Online" />
            <StatusBadge status="alert" label="Alerta" />
            <StatusBadge status="offline" label="Offline" />
          </div>
        </div>
      </section>

      <section className="bg-neutral-bg px-6 py-16 text-center sm:px-10 sm:py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
          <h2 className="font-display text-2xl font-bold tracking-[-0.5px] text-neutral-heading sm:text-3xl">
            Pronto para organizar sua carteira solar?
          </h2>
          <LinkButton href="/login" variant="primary">
            Entrar no painel
          </LinkButton>
        </div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-4 border-t border-neutral-border px-6 py-8 sm:flex-row sm:px-10">
        <SolvoLogo size={28} />
        <p className="font-body text-xs text-neutral-secondary">
          © {new Date().getFullYear()} Solyo. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

const linkButtonVariants = {
  primary: "bg-brand-emerald text-white hover:bg-brand-emerald-md font-display font-semibold",
  amber: "bg-brand-amber text-white hover:bg-brand-amber-hov font-display font-semibold",
  neutral:
    "bg-neutral-bg border border-neutral-border text-neutral-body hover:bg-neutral-border-md font-body font-medium",
};

/** CTA em `size="lg"` do `Button` (`src/components/ui/Button.tsx`), mas como link de verdade — não dá pra aninhar `<button>` dentro de `<a>`. */
function LinkButton({
  href,
  variant,
  target,
  children,
}: {
  href: string;
  variant: keyof typeof linkButtonVariants;
  target?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-btn px-7 text-base tracking-[-0.2px] transition-colors sm:w-auto",
        linkButtonVariants[variant]
      )}
    >
      {children}
    </Link>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-xl font-bold tracking-[-0.5px]">{value}</span>
      <span className="text-center font-body text-[11px] text-white/50">{label}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-neutral-border bg-neutral-surface p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-bg text-brand-emerald">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-neutral-heading">{title}</h3>
      <p className="font-body text-sm text-neutral-secondary">{description}</p>
    </div>
  );
}

function GridTexture() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
      <defs>
        <pattern id="home-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.5)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#home-grid)" />
    </svg>
  );
}
