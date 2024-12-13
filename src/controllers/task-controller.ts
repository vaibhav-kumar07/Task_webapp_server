import { validateSchema, checkAndThrowError } from '../utils/error-utils';
import { createTaskSchema, updateTaskSchema, idSchema, updateTaskStatusSchema } from '../validation-schemas/task';
import TaskService from '../services/task-services';
import { ITask, ITaskStatus } from '../interfaces/task';
import { IUser } from '../interfaces/user';

export default class TaskController {
    private taskService = new TaskService();

    // Create a new task
    public async create(taskData: ITask, user: IUser) {
        const validationResult = validateSchema(createTaskSchema, taskData);
        checkAndThrowError(validationResult);
        return await this.taskService.create(taskData, user);
    }

    // Get a list of tasks with pagination
    public async get(pagination: any) {
        return await this.taskService.get(pagination);
    }

    // Get a task by ID
    public async getById(id: string, user: IUser) {
        const validationResult = validateSchema(idSchema, id);
        checkAndThrowError(validationResult);
        return await this.taskService.getById(id, user);
    }

    // Update a task's details
    public async update(id: string, taskData: ITask) {
        const validationResult = validateSchema(updateTaskSchema, { id, ...taskData });
        checkAndThrowError(validationResult);
        return await this.taskService.update(id, taskData);
    }

    // Update a task's status
    public async updateStatus(id: string, status: string) {
        const validationResult = validateSchema(updateTaskStatusSchema, { id, status });
        checkAndThrowError(validationResult);
        return await this.taskService.updateStatus(id, status as ITaskStatus);
    }

    // Delete a task by ID
    public async delete(id: string) {
        const validationResult = validateSchema(idSchema, id);
        checkAndThrowError(validationResult);
        return await this.taskService.delete(id);
    }

    public async getStats(user: IUser) {
        return await this.taskService.getStats(user);
    }

}