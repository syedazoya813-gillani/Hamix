import { Task, Twin } from "./types";

export const demoTwin: Twin = {
  study_hours: 2.5,
  sleep_hours: 7,
  available_hours: 5,
  workload: "Medium",
};

export const demoTasks: Task[] = [
  { id: "1", title: "DSA Quiz Preparation", deadline: "2026-10-05", priority: "high", hours: 3, status: "progress" },
  { id: "2", title: "Database Assignment", deadline: "2026-10-07", priority: "medium", hours: 5, status: "todo" },
  { id: "3", title: "AI Semester Project", deadline: "2026-10-10", priority: "high", hours: 12, status: "todo" },
  { id: "4", title: "Information Security Lab", deadline: "2026-10-08", priority: "medium", hours: 4, status: "todo" },
];
