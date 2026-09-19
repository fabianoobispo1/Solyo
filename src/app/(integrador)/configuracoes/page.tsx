"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/Button";
import { CalculationSettingsForm } from "@/components/dashboard/CalculationSettingsForm";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import { useCurrentProfile } from "@/lib/data/useCurrentProfile";

const roleLabel: Record<string, string> = {
  integrador_admin: "Integrador",
  cliente_final: "Cliente",
};

export default function ConfiguracoesPage() {
  const profile = useCurrentProfile();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const isLoading = !profile;

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="max-w-lg rounded-card border border-neutral-border bg-neutral-surface p-6">
        <h2 className="font-display text-xl font-bold tracking-[-0.4px] text-neutral-heading">
          Sua conta
        </h2>

        {isLoading ? (
          <p className="mt-4 font-body text-sm text-neutral-secondary">Carregando…</p>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-avatar bg-gradient-to-br font-display text-sm font-semibold text-white",
                getAvatarGradient(profile.name)
              )}
            >
              {getInitials(profile.name)}
            </div>
            <div className="flex flex-col">
              <span className="font-body text-sm font-medium text-neutral-heading">
                {profile.name}
              </span>
              <span className="font-body text-xs text-neutral-secondary">{profile.email}</span>
              <span className="font-body text-xs text-neutral-secondary">
                {roleLabel[profile.role] ?? profile.role}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-neutral-border-md pt-4">
          <Button variant="neutral" size="sm" onClick={handleSignOut}>
            Sair da conta
          </Button>
        </div>
      </section>

      <CalculationSettingsForm />
    </div>
  );
}
