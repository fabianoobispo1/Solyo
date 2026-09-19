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
        "rounded-card px-6 py-[22px]",
        isFilled
          ? "bg-brand-emerald"
          : "border border-neutral-border bg-neutral-surface",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-3 flex h-7 w-7 items-center justify-center rounded-lg",
            isFilled ? "bg-white/15 text-white" : "bg-neutral-bg text-neutral-body"
          )}
        >
          {icon}
        </div>
      )}
      <p
        className={cn(
          "font-body text-xs font-medium uppercase tracking-[0.8px]",
          isFilled ? "text-white/70" : "text-neutral-secondary"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "font-display text-[34px] font-bold tracking-[-1.5px]",
          isFilled ? "text-white" : "text-neutral-heading",
          valueClassName
        )}
      >
        {value}
      </p>
      {sub && (
        <p
          className={cn(
            "mt-1 font-body text-xs",
            isFilled ? "text-white/60" : "text-neutral-secondary"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
