import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type KPICardVariant = "filled" | "outline";

export interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: KPICardVariant;
  valueClassName?: string;
  icon?: ReactNode;
  className?: string;
}

export function KPICard({
  label,
  value,
  sub,
  variant = "outline",
  valueClassName,
  icon,
  className,
}: KPICardProps) {
  const isFilled = variant === "filled";

  return (
    <div
      className={cn(
        "rounded-card px-3.5 py-3.5 sm:px-6 sm:py-[22px]",
        isFilled
          ? "bg-brand-emerald"
          : "border border-neutral-border bg-neutral-surface",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-2 flex h-7 w-7 items-center justify-center rounded-lg sm:mb-3",
            isFilled ? "bg-white/15 text-white" : "bg-neutral-bg text-neutral-body"
          )}
        >
          {icon}
        </div>
      )}
      <p
        className={cn(
          "truncate font-body text-[10px] font-medium uppercase tracking-[0.5px] sm:text-xs sm:tracking-[0.8px]",
          isFilled ? "text-white/70" : "text-neutral-secondary"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "font-display text-xl font-bold tracking-[-0.5px] sm:text-[34px] sm:tracking-[-1.5px]",
          isFilled ? "text-white" : "text-neutral-heading",
          valueClassName
        )}
      >
        {value}
      </p>
      {sub && (
        <p
          className={cn(
            "mt-1 truncate font-body text-[11px] sm:text-xs",
            isFilled ? "text-white/60" : "text-neutral-secondary"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
