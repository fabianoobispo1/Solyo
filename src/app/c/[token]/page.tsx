"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PortalView } from "@/components/portal/PortalView";
import { useClient } from "@/lib/data/useClient";
import { useUpdateLastCleaning } from "@/lib/data/usePlantMutations";

export default function PublicPortalPage({ params }: PageProps<"/c/[token]">) {
  const { token } = use(params);
  const portal = useClient(token);
  const updateLastCleaning = useUpdateLastCleaning();

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

  return (
    <PortalView
      portal={portal}
      onUpdateLastCleaning={async (lastCleaningAt) => {
        await updateLastCleaning({ token, lastCleaningAt });
      }}
    />
  );
}
