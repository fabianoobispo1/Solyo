"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AccountIcon, GlobeIcon, GridIcon, UsersIcon } from "@/components/layout/nav-icons";

interface TabItem {
  label: string;
  href: string;
  icon: ReactNode;
  /** Rota ainda não implementada — ver docs/dashboard-integrador.md */
  disabled?: boolean;
}

const tabs: TabItem[] = [
  { label: "Painel", href: "/dashboard", icon: <GridIcon size={22} /> },
  { label: "Clientes", href: "/clientes", icon: <UsersIcon size={22} />, disabled: true },
  { label: "Portais", href: "/portais", icon: <GlobeIcon size={22} />, disabled: true },
  { label: "Conta", href: "/conta", icon: <AccountIcon size={22} />, disabled: true },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-neutral-border bg-neutral-surface md:hidden">
      {tabs.map((tab) => (
        <Tab key={tab.href} tab={tab} active={pathname === tab.href} />
      ))}
    </nav>
  );
}

function Tab({ tab, active }: { tab: TabItem; active: boolean }) {
  const className = cn(
    "flex flex-1 flex-col items-center gap-1 py-2 font-body text-[10px]",
    active ? "text-brand-emerald font-medium" : "text-neutral-secondary",
    tab.disabled && !active && "text-neutral-muted"
  );

  if (tab.disabled) {
    return (
      <span className={className} title="Em breve — rota ainda não implementada" aria-disabled="true">
        {tab.icon}
        {tab.label}
      </span>
    );
  }

  return (
    <Link href={tab.href} className={className}>
      {tab.icon}
      {tab.label}
    </Link>
  );
}
