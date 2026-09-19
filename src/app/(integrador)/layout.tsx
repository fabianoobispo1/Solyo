"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { useCurrentProfile } from "@/lib/data/useCurrentProfile";

export default function IntegradorLayout({ children }: LayoutProps<"/">) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const profile = useCurrentProfile();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Autenticado mas sem profile = entrou com Google e ainda aguarda
  // aprovação do super admin (ver /acesso-pendente).
  useEffect(() => {
    if (isAuthenticated && profile === null) {
      router.replace("/acesso-pendente");
    }
  }, [isAuthenticated, profile, router]);

  if (isLoading || !isAuthenticated || !profile) {
    return null;
  }

  const userName = profile.name || "Integrador";

  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <Sidebar userName={userName} userRole={profile.isSuperAdmin ? "Super admin" : "Integrador"} isSuperAdmin={profile.isSuperAdmin} />
      <div className="flex flex-1 flex-col">
        <Topbar greetingName={userName.split(" ")[0]} />
        <MobileHeader userName={userName} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav isSuperAdmin={profile.isSuperAdmin} />
    </div>
  );
}
