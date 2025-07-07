export interface Task {
    task_id: string;
    title: string;
    description: string;
    status: string;
    tags: string[];
    due_date?: string;
    estimated_time?: number;
    is_high_priority: boolean;
    created_at: string;
    updated_at?: string;
}

export interface CreateTaskDto {
    title: string;
    description: string;
    status?: string;
    tags?: string[];
    due_date?: string;
    estimated_time?: number;
    is_high_priority?: boolean;
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: string;
    tags?: string[];
    due_date?: string;
    estimated_time?: number;
    is_high_priority?: boolean;
}
