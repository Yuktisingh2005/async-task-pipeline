"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createTask, TaskType } from "@/lib/api";
import { TASK_TYPE_META } from "@/lib/taskMeta";

const TASK_TYPES: TaskType[] = ["pdf_report", "image_resize", "cleanup"];

export default function TriggerForm({ onCreated }: { onCreated: () => void }) {
  const [selected, setSelected] = useState<TaskType>("pdf_report");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  const showFilePicker = selected === "image_resize" || selected === "pdf_report";
  const fileRequired = selected === "image_resize";
  const fileAccept = selected === "image_resize" ? "image/*" : ".csv";
  const fileLabel = selected === "image_resize" ? "Upload an image" : "Upload a CSV (optional)";

  function handleTypeChange(type: TaskType) {
    setSelected(type);
    setFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask(selected, file ?? undefined);
      setJustCreated(true);
      setFile(null);
      onCreated();
      setTimeout(() => setJustCreated(false), 1500);
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !submitting && (!fileRequired || file);

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 flex flex-col gap-5 h-fit sticky top-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Trigger a task
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Enqueue a new job and watch it move through the pipeline in real time.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {TASK_TYPES.map((type) => {
          const meta = TASK_TYPE_META[type];
          const isSelected = selected === type;
          return (
            <motion.button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={
                isSelected
                  ? "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all border-accent/50 bg-accent/10"
                  : "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all border-white/10 bg-white/5 hover:border-white/20"
              }
            >
              <span className="text-2xl">{meta.emoji}</span>
              <span className="text-xs font-medium text-text-primary text-center leading-tight">
                {meta.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showFilePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <label className="text-xs text-text-secondary block mb-2">
              {fileLabel}
            </label>
            <input
              type="file"
              accept={fileAccept}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-accent file:text-white file:text-sm file:font-medium file:cursor-pointer cursor-pointer w-full"
            />
            {selected === "pdf_report" && (
              <p className="text-xs text-text-secondary mt-2">
                Skip this to generate a placeholder report, or upload a CSV
                to render its contents as a table in the PDF.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={!canSubmit}
        whileHover={{ scale: canSubmit ? 1.02 : 1 }}
        whileTap={{ scale: canSubmit ? 0.98 : 1 }}
        className="relative overflow-hidden bg-gradient-to-r from-accent to-accent-2 text-white font-semibold rounded-xl py-3 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <AnimatePresence mode="wait">
          {justCreated ? (
            <motion.span
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="block"
            >
              Task queued
            </motion.span>
          ) : (
            <motion.span
              key="submit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="block"
            >
              {submitting ? "Queuing..." : "Run task"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </form>
  );
}
