"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PortalView } from "@/components/portal/PortalView";
import { useClient } from "@/lib/data/useClient";

export default function PublicPortalPage({ params }: PageProps<"/c/[token]">) {
  const { token } = use(params);
  const portal = useClient(token);

  if (portal === null) {
    notFound();
  }

  if (portal === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-bg">
        <p className="font-body text-sm text-white/50">Carregando portal…</p>
      </div>
    );
  }

  return <PortalView portal={portal} />;
}
