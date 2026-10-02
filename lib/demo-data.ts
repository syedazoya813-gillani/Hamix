import { Task, Twin } from "./types";

export const demoTwin: Twin = {
  study_hours: 2.5,
  sleep_hours: 7,
  available_hours: 5,
  workload_level: "medium",
  work_hours: 0,
  study_start_time: "19:00",
  study_end_time: "21:30",
};

export const demoTasks: Task[] = [
  {
    id: "1",
    title: "DSA Quiz Preparation",
    deadline: "2026-10-05",
    priority: "high",
    estimated_hours: 3,
    status: "in_progress",
  },
  {
    id: "2",
    title: "Database Assignment",
    deadline: "2026-10-07",
    priority: "medium",
    estimated_hours: 5,
    status: "todo",
  },
  {
    id: "3",
    title: "AI Semester Project",
    deadline: "2026-10-10",
    priority: "high",
    estimated_hours: 12,
    status: "todo",
  },
  {
    id: "4",
    title: "Information Security Lab",
    deadline: "2026-10-08",
    priority: "medium",
    estimated_hours: 4,
    status: "todo",
  },
];
