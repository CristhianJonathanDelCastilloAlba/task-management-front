export interface Project {
    id: string;
    name: string;
    description?: string;
    created_by: string;
    created_by_user?: {
        id: string;
        name: string;
        email: string;
        position?: string;
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
    task_count?: number;
    tasks?: any[];
}

export interface CreateProjectDto {
    name: string;
    description?: string;
}
