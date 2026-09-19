"use client";

import { FormEvent, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../../convex/_generated/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const INVALID_MESSAGE: Record<"not_found" | "used" | "expired", string> = {
  not_found: "Este link de convite não existe.",
  used: "Este convite já foi usado para criar uma conta.",
  expired: "Este convite expirou.",
};

type InviteStatus =
  | { valid: true; email: string }
  | { valid: false; reason: "not_found" | "used" | "expired" };

export default function InvitePage({ params }: PageProps<"/convite/[token]">) {
  const { token } = use(params);
  const liveStatus = useQuery(api.invites.getStatus, { token });

  // `getStatus` é reativo: assim que o formulário aceita o convite, ele
  // marca como usado e essa query atualizaria pra "inválido" no meio do
  // fluxo, desmontando o formulário antes do signIn terminar. Por isso
  // "congelamos" a primeira resposta e ignoramos mudanças depois disso —
  // setState condicional durante o render é o padrão recomendado pelo
  // React pra "ajustar estado a partir de uma prop", ao contrário de fazer
  // isso num efeito (veja "You Might Not Need an Effect" nos docs do React).
  const [status, setStatus] = useState<InviteStatus | null>(null);
  if (status === null && liveStatus !== undefined) {
    setStatus(liveStatus);
  }

  return (
    <AuthShell headline="Você foi convidado para o Solyo">
      {status === null && (
        <p className="font-body text-sm text-neutral-secondary">Carregando convite…</p>
      )}
      {status && !status.valid && (
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold tracking-[-0.6px] text-neutral-heading">
            Convite inválido
          </h1>
          <p className="font-body text-sm text-neutral-secondary">
            {INVALID_MESSAGE[status.reason]} Fale com a Solyo pra receber um
            novo link.
          </p>
        </div>
      )}
      {status && status.valid && <AcceptInviteForm token={token} email={status.email} />}
    </AuthShell>
  );
}

function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const acceptInvite = useAction(api.invites.accept);
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingSession, setAwaitingSession] = useState(false);

  // Só navega quando o estado reativo de auth confirmar a sessão nova —
  // um router.push logo após o signIn corre na frente disso e o guard do
  // layout do dashboard manda de volta pro /login.
  useEffect(() => {
    if (awaitingSession && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [awaitingSession, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      await acceptInvite({ token, name, password });

      // Se o navegador já tinha uma sessão de outra conta, precisa encerrar
      // antes — senão o signIn abaixo não troca pra conta recém-criada.
      await signOut().catch(() => {});

      const signInData = new FormData();
      signInData.set("flow", "signIn");
      signInData.set("email", email);
      signInData.set("password", password);
      await signIn("password", signInData);

      setAwaitingSession(true);
    } catch {
      setError("Não foi possível criar sua conta. Tente novamente ou peça um novo convite.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-[-0.6px] text-neutral-heading">
          Crie sua conta
        </h1>
        <p className="font-body text-sm text-neutral-secondary">Convite para {email}.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="E-mail" value={email} disabled readOnly />
        <Input label="Seu nome" name="name" placeholder="Ex: Ana Ferreira" required />
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={8}
          error={error ?? undefined}
        />
        <Button variant="primary" size="lg" type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Criando conta…" : "Criar conta"}
        </Button>
      </form>
    </>
  );
}
