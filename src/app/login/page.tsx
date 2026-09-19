"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-[-0.6px] text-neutral-heading">
          Bem-vindo(a) de volta
        </h1>
        <p className="font-body text-sm text-neutral-secondary">
          Entre com sua conta de integrador para acessar o painel.
        </p>
      </div>

      <LoginForm />

      <div className="flex items-center gap-3 font-body text-xs text-neutral-secondary">
        <span className="h-px flex-1 bg-neutral-border" />
        ou
        <span className="h-px flex-1 bg-neutral-border" />
      </div>

      <GoogleButton />

      <p className="text-center font-body text-sm text-neutral-secondary">
        Ainda não tem conta?{" "}
        <span
          className="cursor-not-allowed font-medium text-brand-emerald"
          title="Precisa de um convite — fale com a Solyo"
        >
          Fale com a Solyo
        </span>
      </p>
    </AuthShell>
  );
}

function LoginForm() {
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
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.set("flow", "signIn");

    try {
      // Se o navegador já tinha uma sessão de outra conta, precisa encerrar
      // antes — senão o signIn não troca pra conta que está entrando agora.
      await signOut().catch(() => {});
      await signIn("password", formData);
      setAwaitingSession(true);
    } catch {
      setError("E-mail ou senha incorretos.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="E-mail"
        name="email"
        type="email"
        placeholder="voce@empresa.com"
        autoComplete="email"
        required
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        error={error ?? undefined}
      />
      <Button variant="primary" size="lg" type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}

function GoogleButton() {
  const { signIn } = useAuthActions();
  const [redirecting, setRedirecting] = useState(false);

  return (
    <Button
      variant="neutral"
      size="lg"
      type="button"
      className="w-full gap-2.5"
      disabled={redirecting}
      onClick={() => {
        setRedirecting(true);
        signIn("google", { redirectTo: "/dashboard" }).catch(() => setRedirecting(false));
      }}
    >
      <GoogleIcon />
      Continuar com Google
    </Button>
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
