"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { cn } from "@/lib/cn";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { SolvoLogo } from "@/components/ui/SolvoLogo";
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

export interface SidebarProps {
  userName: string;
  userRole: string;
}

export function Sidebar({ userName, userRole }: SidebarProps) {
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

      <UserMenu userName={userName} userRole={userRole} />
    </aside>
  );
}

function UserMenu({ userName, userRole }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuthActions();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="relative border-t border-neutral-border-md px-3 py-4">
      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-10"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div className="absolute bottom-full left-3 right-3 z-20 mb-1 rounded-btn border border-neutral-border bg-neutral-surface p-1 shadow-lg">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-btn-sm px-3 py-2 text-left font-body text-sm text-neutral-body hover:bg-neutral-bg"
          >
            Sair
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative z-20 flex w-full items-center gap-2.5 rounded-btn px-2 py-2 text-left hover:bg-neutral-bg"
      >
        <div
          className={cn(
            "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-avatar bg-gradient-to-br font-display text-xs font-semibold text-white",
            getAvatarGradient(userName)
          )}
        >
          {getInitials(userName)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-body text-sm font-medium text-neutral-heading">
            {userName}
          </span>
          <span className="truncate font-body text-xs text-neutral-secondary">{userRole}</span>
        </div>
        <span className="text-neutral-secondary">
          <ChevronDownIcon />
        </span>
      </button>
    </div>
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
