import { User } from './user.model';
import { Subtask } from './subtask.model';
import { Comment } from './comment.model';

export interface Task {
    id: string;
    name: string;
    description: string;
    estimated_time: number | null;
    responsible_id: string;
    status: string;
    comments: Comment[];
    task_image_url: string | null;
    task_images: string[] | null;
    area: string;
    created_at: string;
    finished_at: string | null;
    updated_at: string;
    created_by: string;
    project_id: string;
    module_id: string;
    priority: 'high' | 'medium' | 'low';
    subtasks: Subtask[];
    users: User;
}