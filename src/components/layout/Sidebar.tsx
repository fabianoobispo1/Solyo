"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { SolvoLogo } from "@/components/ui/SolvoLogo";
import { mockIntegratorUser } from "@/lib/mock-data";
import { ChevronDownIcon, GlobeIcon, GridIcon, SettingsIcon, UsersIcon } from "@/components/layout/nav-icons";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  /** Rota ainda não implementada — ver docs/dashboard-integrador.md */
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: "Painel", href: "/dashboard", icon: <GridIcon /> },
  { label: "Clientes", href: "/clientes", icon: <UsersIcon />, disabled: true },
  { label: "Portais", href: "/portais", icon: <GlobeIcon />, disabled: true },
];

const settingsItem: NavItem = {
  label: "Configurações",
  href: "/configuracoes",
  icon: <SettingsIcon />,
  disabled: true,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[220px] shrink-0 flex-col border-r border-neutral-border bg-neutral-surface md:flex">
      <div className="px-5 py-6">
        <SolvoLogo />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <div className="my-2 border-t border-neutral-border-md" />

        <NavLink item={settingsItem} active={pathname === settingsItem.href} />
      </nav>

      <div className="border-t border-neutral-border-md px-3 py-4">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-btn px-2 py-2 text-left hover:bg-neutral-bg"
        >
          <div
            className={cn(
              "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-avatar bg-gradient-to-br font-display text-xs font-semibold text-white",
              getAvatarGradient(mockIntegratorUser.name)
            )}
          >
            {getInitials(mockIntegratorUser.name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-body text-sm font-medium text-neutral-heading">
              {mockIntegratorUser.name}
            </span>
            <span className="truncate font-body text-xs text-neutral-secondary">
              {mockIntegratorUser.role}
            </span>
          </div>
          <span className="text-neutral-secondary">
            <ChevronDownIcon />
          </span>
        </button>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const className = cn(
    "flex items-center gap-2.5 rounded-btn px-3 py-2.5 font-body text-sm transition-colors",
    active
      ? "bg-[#EBF3F0] text-brand-emerald font-medium"
      : "text-neutral-body hover:bg-neutral-bg",
    item.disabled && !active && "cursor-not-allowed text-neutral-muted hover:bg-transparent"
  );

  if (item.disabled) {
    return (
      <span
        className={className}
        title="Em breve — rota ainda não implementada"
        aria-disabled="true"
      >
        {item.icon}
        {item.label}
      </span>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.icon}
      {item.label}
    </Link>
  );
}
