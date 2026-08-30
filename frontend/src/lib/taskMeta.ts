import { TaskType } from "./api";

export const TASK_TYPE_META: Record<TaskType, { label: string; emoji: string; description: string }> = {
  image_resize: {
    label: "Image Resize",
    emoji: "🖼️",
    description: "Resize an uploaded image into a thumbnail",
  },
  pdf_report: {
    label: "PDF Report",
    emoji: "📄",
    description: "Generate a PDF report",
  },
  cleanup: {
    label: "Cleanup",
    emoji: "🧹",
    description: "Trigger a cleanup task run",
  },
};