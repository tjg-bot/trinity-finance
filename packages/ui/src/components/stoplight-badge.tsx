import * as React from "react";
import { cn } from "../utils";

type StoplightStatus = "GREEN" | "YELLOW" | "RED" | "PENDING";

interface StoplightBadgeProps {
  status: StoplightStatus;
  className?: string;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<StoplightStatus, { label: string; dot: string; badge: string }> = {
  GREEN: {
    label: "Verified",
    dot: "bg-[#16A34A]",
    badge: "bg-green-100 text-green-800 border-green-200",
  },
  YELLOW: {
    label: "Needs Clarification",
    dot: "bg-[#EAB308]",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  RED: {
    label: "Re-upload Required",
    dot: "bg-[#DC2626]",
    badge: "bg-red-100 text-red-800 border-red-200",
  },
  PENDING: {
    label: "Pending Review",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export function StoplightBadge({ status, className, showLabel = true }: StoplightBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.badge,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full flex-shrink-0", config.dot)} />
      {showLabel && config.label}
    </span>
  );
}
