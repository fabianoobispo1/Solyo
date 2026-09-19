import Link from "next/link";
import { SolvoLogo } from "@/components/ui/SolvoLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-bg px-6 text-center">
      <SolvoLogo />
      <div className="flex flex-col gap-2">
        <span className="font-display text-6xl font-bold tracking-[-2px] text-brand-emerald">
          404
        </span>
        <h1 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
          Página não encontrada
        </h1>
        <p className="max-w-sm font-body text-sm text-neutral-secondary">
          O endereço não existe ou o link que você seguiu pode estar
          desatualizado.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand-emerald px-6 font-display text-[15px] font-semibold tracking-[-0.2px] text-white transition-colors hover:bg-brand-emerald-md"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
