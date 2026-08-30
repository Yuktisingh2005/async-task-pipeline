"use client";

import { motion } from "framer-motion";
import { TaskStatus, TaskType } from "@/lib/api";
import { TASK_TYPE_META } from "@/lib/taskMeta";

interface Props {
  statusFilter: TaskStatus | "all";
  typeFilter: TaskType | "all";
  onStatusChange: (s: TaskStatus | "all") => void;
  onTypeChange: (t: TaskType | "all") => void;
}

const STATUSES: (TaskStatus | "all")[] = ["all", "pending", "processing", "done", "failed"];
const TYPES: (TaskType | "all")[] = ["all", "pdf_report", "image_resize", "cleanup"];

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? "bg-accent/15 text-accent border-accent/40"
          : "bg-white/[0.02] text-text-secondary border-white/10 hover:border-white/20 hover:text-text-primary"
      }`}
    >
      {children}
    </motion.button>
  );
}

export default function FilterBar({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
}: Props) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Pill key={s} active={statusFilter === s} onClick={() => onStatusChange(s)}>
            {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Pill key={t} active={typeFilter === t} onClick={() => onTypeChange(t)}>
            {t === "all" ? "All types" : TASK_TYPE_META[t].label}
          </Pill>
        ))}
      </div>
    </div>
  );
}