import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SolvoLogo } from "@/components/ui/SolvoLogo";

export default function LoginPage() {
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
              Gerencie sua carteira solar com clareza total
            </h2>
            <p className="max-w-sm font-body text-sm text-white/60">
              Acompanhe geração, economia e alertas de todos os seus clientes
              em um só painel — e ofereça um portal white-label para cada um
              deles.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          <Stat value="+2.400" label="clientes monitorados" />
          <Stat value="98%" label="uptime de geração" />
          <Stat value="R$4M" label="economizados" />
        </div>
      </section>

      <section className="flex w-full flex-1 items-center justify-center bg-neutral-surface px-6 py-16 sm:px-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold tracking-[-0.6px] text-neutral-heading">
              Bem-vindo(a) de volta
            </h1>
            <p className="font-body text-sm text-neutral-secondary">
              Entre com sua conta de integrador para acessar o painel.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input label="E-mail" type="email" placeholder="voce@empresa.com" />
            <Input label="Senha" type="password" placeholder="••••••••" />
          </div>

          <Button variant="primary" size="lg" type="button" className="w-full">
            Entrar
          </Button>

          <div className="flex items-center gap-3 font-body text-xs text-neutral-secondary">
            <span className="h-px flex-1 bg-neutral-border" />
            ou
            <span className="h-px flex-1 bg-neutral-border" />
          </div>

          <Button variant="neutral" size="lg" type="button" className="w-full gap-2.5">
            <GoogleIcon />
            Continuar com Google
          </Button>

          <p className="text-center font-body text-sm text-neutral-secondary">
            Ainda não tem conta?{" "}
            <span
              className="cursor-not-allowed font-medium text-brand-emerald"
              title="Em breve — canal de contato ainda não definido"
            >
              Fale com a Solyo
            </span>
          </p>
        </div>
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
        <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.5)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-grid)" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
