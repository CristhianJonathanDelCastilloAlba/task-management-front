import { Task } from './task.model';

export interface Column {
    id: string;
    title: string;
    status: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    tasks: Task[];
}