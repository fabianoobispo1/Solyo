import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "amber"
  | "neutral"
  | "danger"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-emerald text-white hover:bg-brand-emerald-md font-display font-semibold",
  secondary:
    "bg-transparent border border-brand-emerald text-brand-emerald hover:bg-brand-emerald/5 font-body font-medium",
  amber:
    "bg-brand-amber text-white hover:bg-brand-amber-hov font-display font-semibold",
  neutral:
    "bg-neutral-bg border border-neutral-border text-neutral-body hover:bg-neutral-border-md font-body font-medium",
  danger: "bg-danger text-white hover:bg-danger/90 font-display font-semibold",
  ghost:
    "bg-transparent text-neutral-body hover:bg-neutral-bg font-body font-medium",
};

const sizeStyles: Record<ButtonSize, string> = {
  lg: "h-[54px] px-7 text-base rounded-btn",
  md: "h-12 px-6 text-[15px] rounded-btn",
  sm: "h-[38px] px-4 text-sm rounded-btn-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 tracking-[-0.2px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
