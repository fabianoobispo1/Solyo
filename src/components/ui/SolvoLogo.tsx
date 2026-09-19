import { cn } from "@/lib/cn";

export type SolvoLogoVariant = "sidebar" | "dark";

export interface SolvoLogoProps {
  variant?: SolvoLogoVariant;
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function SolvoLogo({
  variant = "sidebar",
  size = 36,
  showWordmark = true,
  className,
}: SolvoLogoProps) {
  const badgeFill = variant === "dark" ? "rgba(255,255,255,0.15)" : "#0C5A46";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="10" fill={badgeFill} />
        <circle cx="18" cy="13" r="5.5" fill="#F2A422" />
        <path
          d="M9 26c0-5 4-9 9-9s9 4 9 9"
          stroke="#F2A422"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <line
          x1="6"
          y1="26"
          x2="30"
          y2="26"
          stroke="#F2A422"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span
          className={cn(
            "font-display text-lg font-bold tracking-[-0.5px]",
            variant === "dark" ? "text-white" : "text-neutral-heading"
          )}
        >
          Solyo
        </span>
      )}
    </div>
  );
}
