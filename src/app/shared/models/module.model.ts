

export interface Module {
    id: string;
    name: string;
    description?: string;
    project_id: string;
    project?: {
        id: string;
        name: string;
        created_by: string;
    };
    created_by: string;
    created_by_user?: {
        id: string;
        name: string;
        email: string;
        position?: string;
    };
    is_active: boolean;
    order_index: number;
    created_at: string;
    updated_at: string;
    task_count?: number;
    tasks?: any[];
}

export interface CreateModuleDto {
    name: string;
    description?: string;
    project_id: string;
    order_index?: number;
}