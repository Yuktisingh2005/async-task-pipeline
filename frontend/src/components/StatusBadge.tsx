"use client";

import { motion } from "framer-motion";
import { TaskStatus } from "@/lib/api";

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
  border: string;
  pulse: boolean;
};

function getStatusConfig(status: TaskStatus): StatusConfig {
  if (status === "pending") {
    return {
      label: "Pending",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.1)",
      border: "rgba(251,191,36,0.3)",
      pulse: true,
    };
  }
  if (status === "processing") {
    return {
      label: "Processing",
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.1)",
      border: "rgba(96,165,250,0.3)",
      pulse: true,
    };
  }
  if (status === "done") {
    return {
      label: "Done",
      color: "#34d399",
      bg: "rgba(52,211,153,0.1)",
      border: "rgba(52,211,153,0.3)",
      pulse: false,
    };
  }
  return {
    label: "Failed",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.3)",
    pulse: false,
  };
}

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = getStatusConfig(status);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: cfg.color }}
        animate={
          cfg.pulse
            ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }
            : { opacity: 1, scale: 1 }
        }
        transition={
          cfg.pulse ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : {}
        }
      />
      {cfg.label}
    </span>
  );
}
