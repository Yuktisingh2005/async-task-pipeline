import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api";

export const api = axios.create({
  baseURL: API_URL,
});

export type TaskType = "image_resize" | "pdf_report" | "cleanup";
export type TaskStatus = "pending" | "processing" | "done" | "failed";

export interface Task {
  id: string;
  task_type: TaskType;
  status: TaskStatus;
  input_file: string | null;
  result_file: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface TaskListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await api.get<TaskListResponse>("/tasks/");
  return res.data.results;
}

export async function createTask(
  taskType: TaskType,
  file?: File
): Promise<Task> {
  const formData = new FormData();
  formData.append("task_type", taskType);
  if (file) {
    formData.append("input_file", file);
  }
  const res = await api.post<Task>("/tasks/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function fetchTask(id: string): Promise<Task> {
  const res = await api.get<Task>(`/tasks/${id}/`);
  return res.data;
}