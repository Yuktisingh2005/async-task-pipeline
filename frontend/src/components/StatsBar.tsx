"use client";

import { motion } from "framer-motion";
import { Task } from "@/lib/api";

export default function StatsBar({ tasks }: { tasks: Task[] }) {
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const processingCount = tasks.filter((t) => t.status === "processing").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const failedCount = tasks.filter((t) => t.status === "failed").length;

  const stats = [
    { label: "Pending", value: pendingCount, color: "#fbbf24" },
    { label: "Processing", value: processingCount, color: "#60a5fa" },
    { label: "Done", value: doneCount, color: "#34d399" },
    { label: "Failed", value: failedCount, color: "#f87171" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="glass glass-hover rounded-2xl p-5 relative overflow-hidden"
        >
          <div
            className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20"
            style={{ backgroundColor: s.color }}
          />
          <p className="text-xs text-text-secondary mb-1.5 uppercase tracking-wider font-medium">
            {s.label}
          </p>
          <motion.p
            key={s.value}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold"
            style={{ color: s.color, fontFamily: "var(--font-display)" }}
          >
            {s.value}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}
