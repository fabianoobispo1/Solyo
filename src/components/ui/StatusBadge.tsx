import { cn } from "@/lib/cn";

export type StatusKind = "online" | "alert" | "offline" | "inactive";

export interface StatusBadgeProps {
  status: StatusKind;
  label: string;
  className?: string;
}

const statusStyles: Record<StatusKind, string> = {
  online: "bg-status-online-bg border-status-online-bdr text-status-online-txt",
  alert: "bg-status-alert-bg border-status-alert-bdr text-status-alert-txt",
  offline:
    "bg-status-offline-bg border-status-offline-bdr text-status-offline-txt",
  inactive:
    "bg-status-inactive-bg border-status-inactive-bdr text-status-inactive-txt",
};

const dotStyles: Record<StatusKind, string> = {
  online: "bg-status-online-dot",
  alert: "bg-status-alert-dot",
  offline: "bg-status-offline-dot",
  inactive: "bg-status-inactive-dot",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-badge border px-2.5 py-1 font-body text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[status])} />
      {label}
    </span>
  );
}
