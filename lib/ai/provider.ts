export type ExtractionType = 'TASK'|'GOAL'|'HABIT'|'EVENT'|'DEADLINE'|'PROJECT'|'SCHEDULE'|'CONSTRAINT'|'NOTE'|'UNKNOWN';

export interface ExtractionResult {
  type: ExtractionType;
  title?: string;
  description?: string;
  deadline?: string;
  priority?: 'low'|'medium'|'high';
  estimatedHours?: number;
  confidence: number;
}

export interface AIProvider {
  extract(input: string): Promise<ExtractionResult>;
  insights(input: unknown): Promise<string>;
}
