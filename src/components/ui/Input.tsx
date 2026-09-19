import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body text-[13px] font-medium text-neutral-heading"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-12 rounded-input border-[1.5px] border-neutral-border bg-neutral-subtle px-4 font-body text-[15px] text-neutral-heading outline-none placeholder:text-neutral-secondary",
            "focus:border-2 focus:border-brand-emerald focus:bg-neutral-surface",
            error && "border-danger bg-danger-bg focus:border-danger",
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error && (
          <span className="font-body text-xs text-danger">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
