"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { useCurrentProfile } from "@/lib/data/useCurrentProfile";

export default function AcessoPendentePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useCurrentProfile();
  const request = useQuery(api.accessRequests.myRequest);
  const { signOut } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  // Aprovado (reativo, sem precisar recarregar) → segue direto pro painel.
  useEffect(() => {
    if (profile) router.replace("/dashboard");
  }, [profile, router]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  if (isLoading || !isAuthenticated || profile === undefined || profile) return null;

  const rejected = request?.status === "rejected";

  return (
    <AuthShell>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-[-0.6px] text-neutral-heading">
          {rejected ? "Solicitação recusada" : "Solicitação enviada"}
        </h1>
        <p className="font-body text-sm text-neutral-secondary">
          {rejected
            ? "Não foi possível liberar o acesso para esta conta. Se acha que foi um engano, fale com a Solyo."
            : "Ainda não existe uma conta Solyo para o seu e-mail, então enviamos um pedido de acesso para a nossa equipe. Assim que for aprovado, é só entrar de novo com o Google."}
        </p>
        {request?.email && (
          <p className="font-body text-sm font-medium text-neutral-heading">{request.email}</p>
        )}
      </div>

      <Button variant="neutral" size="lg" type="button" className="w-full" onClick={handleSignOut}>
        Sair
      </Button>
    </AuthShell>
  );
}
