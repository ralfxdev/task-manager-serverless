import { Task, CreateTaskDto, UpdateTaskDto } from "../../../domain/Task";

export interface DynamoManager {
    findAll(): Promise<Task[]>;
    findById(id: string): Promise<Task[] | null>;
    create(task: CreateTaskDto): Promise<Task>;
    update(id: string, task: UpdateTaskDto): Promise<Task | null>;
    delete(id: string): Promise<boolean>;
}
