
import mongoose from "mongoose";
import { IAuditFields } from "./audit";

export enum ITaskStatus {
    PENDING = 'pending',
    FINISHED = 'finished',
}




export interface ITask extends IAuditFields {
    _id?: string;
    title: string;
    start_time: Number | string;
    end_time: Number | string;
    priority: string;
    status: ITaskStatus;
}

export interface ITaskFilters {
    priority?: string;
    status?: ITaskStatus;
    start_date?: Date;
    end_date?: Date;
}

export interface ITaskStatistics {
    total_tasks: number;
    completed_percentage: number;
    pending_percentage: number;
    time_lapsed_by_priority: Record<number, number>;
    balance_estimated_time_by_priority: Record<number, number>;
    average_completion_time: number;
}
