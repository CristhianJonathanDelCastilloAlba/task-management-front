export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  images?: string[];
  task_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}