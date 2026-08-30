"use client";

import { motion } from "framer-motion";
import { Task } from "@/lib/api";
import { TASK_TYPE_META } from "@/lib/taskMeta";
import StatusBadge from "./StatusBadge";

export default function TaskCard({ task }: { task: Task }) {
  const meta = TASK_TYPE_META[task.task_type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="glass glass-hover rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
            {meta.emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{meta.label}</p>
            <p className="text-xs text-text-secondary font-mono tracking-wide">
              {task.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <StatusBadge status={task.status} />
      </div>

      {task.error_message && (
        <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 line-clamp-2">
          {task.error_message}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-white/5">
        <span>{new Date(task.created_at).toLocaleTimeString()}</span>
        {task.result_file && (
          <a
            href={task.result_file}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-2 hover:underline font-medium transition-colors"
          >
            View result (opens in new tab)
          </a>
        )}
      </div>
    </motion.div>
  );
}
