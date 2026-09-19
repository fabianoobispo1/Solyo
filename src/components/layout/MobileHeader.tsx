import { cn } from "@/lib/cn";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { SolvoLogo } from "@/components/ui/SolvoLogo";
import { BellIcon } from "@/components/layout/nav-icons";
import { mockIntegratorUser } from "@/lib/mock-data";

export function MobileHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-border bg-neutral-surface px-4 md:hidden">
      <SolvoLogo size={30} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notificações"
          className="flex h-8 w-8 items-center justify-center rounded-btn-sm text-neutral-secondary hover:bg-neutral-bg"
        >
          <BellIcon size={20} />
        </button>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-avatar bg-gradient-to-br font-display text-[11px] font-semibold text-white",
            getAvatarGradient(mockIntegratorUser.name)
          )}
        >
          {getInitials(mockIntegratorUser.name)}
        </div>
      </div>
    </header>
  );
}
