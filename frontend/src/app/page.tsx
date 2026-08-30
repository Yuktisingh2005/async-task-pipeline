"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTaskPolling } from "@/lib/usePolling";
import { TaskStatus, TaskType } from "@/lib/api";
import TriggerForm from "@/components/TriggerForm";
import TaskCard from "@/components/TaskCard";
import FilterBar from "@/components/FilterBar";
import StatsBar from "@/components/StatsBar";

export default function Home() {
  const { tasks, loading, refresh } = useTaskPolling(2000);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (typeFilter !== "all" && t.task_type !== typeFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, typeFilter]);

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto flex flex-col gap-8">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-4xl"
          >
            ⚡
          </motion.span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text font-[family-name:var(--font-display)]">
            Async Task Pipeline
          </h1>
        </div>
        <p className="text-text-secondary text-sm md:text-base ml-1">
          Live dashboard — tasks are processed by Celery workers in the background.
        </p>
      </motion.header>

      <StatsBar tasks={tasks} />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        <TriggerForm onCreated={refresh} />

        <div className="flex flex-col gap-4">
          <FilterBar
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
          />

          {loading ? (
            <div className="glass rounded-2xl p-8 text-center text-sm text-text-secondary">
              Loading tasks…
            </div>
          ) : filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-10 text-center text-sm text-text-secondary border-dashed"
            >
              No tasks match these filters yet.
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}