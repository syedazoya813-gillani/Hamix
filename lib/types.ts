export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type WorkloadLevel = 'low' | 'medium' | 'high';

export interface Task { id: string; title: string; description?: string | null; status: TaskStatus; priority: Priority; estimated_hours: number; deadline?: string | null; }
export interface Goal { id: string; title: string; description?: string | null; target_date?: string | null; priority: Priority; progress: number; }
export interface Twin { available_hours: number; sleep_hours: number; workload_level: WorkloadLevel; study_hours: number; work_hours: number; }
