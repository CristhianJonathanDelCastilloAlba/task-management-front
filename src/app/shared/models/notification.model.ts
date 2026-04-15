
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'comment' | 'task_created' | 'task_updated' | 'task_deleted';
    reference_id: string;
    project_id: string | null;
    module_id: string | null;
    task_id: string | null;
    is_read: boolean;
    created_by: string | null;
    created_at: string;
    read_at: string | null;
    creator?: {
        id: string;
        name: string;
    };
    project?: {
        id: string;
        name: string;
    };
    module?: {
        id: string;
        name: string;
    };
    task?: {
        id: string;
        name: string;
    };
}

export interface NotificationsResponse {
    notifications: Notification[];
    unread_count: number;
    total: number;
}
