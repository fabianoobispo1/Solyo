"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { SolvoLogo } from "@/components/ui/SolvoLogo";
import { mockIntegratorUser } from "@/lib/mock-data";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  /** Rota ainda não implementada — ver docs/dashboard-integrador.md */
  disabled?: boolean;
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="6.5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 15c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="13" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11.5 15c0-2 1.5-3.5 3.5-3.5s3 1.2 3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 9h14M9 2c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 2.5v2M9 13.5v2M15.5 9h-2M4.5 9h-2M13.5 4.5l-1.4 1.4M5.9 12.1l-1.4 1.4M13.5 13.5l-1.4-1.4M5.9 5.9 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 5.25 7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-neutral-border bg-neutral-surface">
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
