import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { KPICard } from "@/components/ui/KPICard";
import { SolvoLogo } from "@/components/ui/SolvoLogo";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-12 bg-neutral-bg px-10 py-12">
      <section className="flex flex-col gap-4">
        <SolvoLogo />
        <h1 className="font-display text-2xl font-bold tracking-[-0.6px] text-neutral-heading">
          Componentes base — Solyo
        </h1>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
          Button
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="amber">Amber</Button>
          <Button variant="neutral">Neutral</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Large</Button>
          <Button size="md">Medium</Button>
          <Button size="sm">Small</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
          StatusBadge
        </h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="online" label="Online" />
          <StatusBadge status="alert" label="Alerta" />
          <StatusBadge status="offline" label="Offline" />
          <StatusBadge status="inactive" label="Inativo" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
          Input
        </h2>
        <div className="grid max-w-md gap-4">
          <Input label="E-mail" placeholder="voce@empresa.com" />
          <Input label="Senha" type="password" placeholder="••••••••" />
          <Input
            label="Senha"
            type="password"
            defaultValue="123"
            error="Senha deve ter ao menos 8 caracteres"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
          KPICard
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            variant="filled"
            label="Geração hoje"
            value="892 kWh"
            sub="+12% vs. ontem"
          />
          <KPICard label="Clientes ativos" value="248" sub="+18 este mês" />
          <KPICard label="Economia total" value="R$ 128k" sub="acumulado" />
          <KPICard label="Alertas" value="3" sub="requer atenção" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
          SolvoLogo
        </h2>
        <div className="flex items-center gap-6 rounded-card bg-dark-bg p-6">
          <SolvoLogo variant="dark" />
          <SolvoLogo variant="dark" size={48} />
        </div>
      </section>
    </div>
  );
}
