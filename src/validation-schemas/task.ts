import z from "zod";
import { ITaskStatus } from "../interfaces/task";
export const idSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const createTaskSchema = z.object({
    title: z.string().min(1),
    start_time: z.string(),
    end_time: z.string(),
    priority: z.enum(['1', '2', '3', '4', '5']).transform(Number),
});

export const updateTaskSchema = z.object({
    id: idSchema,
    title: z.string().min(1).optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    priority: z.enum(['1', '2', '3', '4', '5']).transform(Number).optional(),
    status: z.enum([ITaskStatus.PENDING, ITaskStatus.FINISHED]).optional(),
});

export const taskFiltersSchema = z.object({
    priority: z.enum(['1', '2', '3', '4', '5']).optional(),
    status: z.enum([ITaskStatus.PENDING, ITaskStatus.FINISHED]).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});
export const updateTaskStatusSchema = z.object({
    id: idSchema,
    status: z.enum([ITaskStatus.PENDING, ITaskStatus.FINISHED]),
});