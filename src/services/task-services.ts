import { ITask, ITaskStatus } from '../interfaces/task';
import { IUser } from '../interfaces/user';
import Task from '../models/task'; // Import the GMT conversion utility
import { throwBusinessError } from '../utils/error-utils';
import { applyPagination } from '../utils/pagination-sort-utils';

export default class TaskService {

    private async save(input: Partial<ITask>, isNew: boolean = true): Promise<ITask> {
        const task = new Task(input);
        task.isNew = isNew;
        console.log("task", task)
        return (await task.save()).toObject();
    }

    // Create a new task
    public async create(taskData: Partial<ITask>, user: IUser): Promise<ITask> {
        const existingTask = await Task.findOne({ title: taskData.title, start_time: taskData.start_time });

        throwBusinessError(!!existingTask, 'A task with the same title and start time already exists');

        taskData.created_by = user.email
        taskData.updated_by = user.email
        console.log("taskData", taskData)
        // Use save to create the new task
        return (await this.save(taskData, true))
    }

    // Update an existing task
    public async update(id: string, taskData: Partial<ITask>): Promise<ITask> {
        const existingTask = await Task.findById(id);

        // Throw error if the task is not found
        throwBusinessError(!existingTask, 'Task not found for update');

        // Ensure existingTask is not null before proceeding
        if (!existingTask) {
            throw new Error('Task not found');
        }

        // Convert start_time and end_time to GMT Date objects if they are being updated
        if (taskData.start_time) {
            taskData.start_time = taskData.start_time as string
        }
        if (taskData.end_time) {
            taskData.end_time = taskData.end_time as string
        }

        // Merge the existing task's data with the new data and use save for update
        const updatedTask = { ...existingTask.toObject(), ...taskData, updated_at: new Date() };
        return await this.save(updatedTask, false);
    }

    // Update task status
    public async updateStatus(id: string, status: ITaskStatus): Promise<ITask> {
        const existingTask = await Task.findById(id);

        // Throw error if the task is not found
        throwBusinessError(!existingTask, 'Task not found for status update');

        // Ensure existingTask is not null before proceeding
        if (!existingTask) {
            throw new Error('Task not found');
        }

        // Update task status and modified date
        existingTask.status = status;
        existingTask.updated_at = new Date(); // Use current date as updated time

        return await this.save(existingTask, false);
    }

    // Get a task by ID
    public async getById(id: string, user: IUser): Promise<ITask | null> {
        const task = await Task.findOne({ _id: id, created_by: user.email });
        return task as ITask;
    }

    // Get tasks with pagination
    public async get(pagination: any): Promise<any> {
        const { limit, skip } = applyPagination(pagination);

        const tasksList = await Task.find()
            .collation({ locale: 'en' })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalCount = await Task.countDocuments();
        return {
            data: tasksList,
            meta: {
                pagination: {
                    page: skip / limit + 1,
                    pageSize: limit,
                    pageCount: Math.ceil(totalCount / limit),
                    total: totalCount,
                },
            },
        };
    }

    // Delete a task by ID
    public async delete(id: string): Promise<void> {
        const deletedTask = await Task.findByIdAndDelete(id);

        // Throw error if the task is not found
        throwBusinessError(!deletedTask, 'Task not found for deletion');
    }

    public getStats = async (user: IUser) => {
        const pipeline = [
            { $match: { created_by: user.email } },

            {
                $facet: {
                    totalTasks: [{ $count: "total" }],
                    completedTasks: [
                        { $match: { status: ITaskStatus.FINISHED } },
                        { $count: ITaskStatus.FINISHED }
                    ],
                    pendingTasks: [
                        { $match: { status: ITaskStatus.PENDING } },
                        { $count: ITaskStatus.PENDING }
                    ],
                    priorityStats: [
                        {
                            $group: {
                                _id: "$priority",
                                totalTime: { $sum: { $subtract: ["$end_time", "$start_time"] } },
                                completedTime: { $sum: { $cond: [{ $eq: ["$status", ITaskStatus.FINISHED] }, { $subtract: ["$end_time", "$start_time"] }, 0] } },
                                pendingTime: { $sum: { $cond: [{ $eq: ["$status", ITaskStatus.PENDING] }, { $subtract: ["$end_time", "$start_time"] }, 0] } }
                            }
                        }
                    ],
                    avgCompletionTime: [
                        { $match: { status: ITaskStatus.FINISHED } },
                        {
                            $project: {
                                completionTime: { $divide: [{ $subtract: ["$end_time", "$start_time"] }, 1000 * 60 * 60] } // in hours
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgTime: { $avg: "$completionTime" }
                            }
                        }
                    ]
                }
            },

            {
                $project: {
                    totalCount: { $arrayElemAt: ["$totalTasks.total", 0] },
                    completedPercentage: { $multiply: [{ $divide: [{ $arrayElemAt: ["$completedTasks.finished", 0] }, { $arrayElemAt: ["$totalTasks.total", 0] }] }, 100] },
                    pendingPercentage: { $multiply: [{ $divide: [{ $arrayElemAt: ["$pendingTasks.pending", 0] }, { $arrayElemAt: ["$totalTasks.total", 0] }] }, 100] },
                    timeLapsed: { $sum: "$priorityStats.completedTime" },
                    timeLeft: { $sum: "$priorityStats.pendingTime" },
                    priorityTimes: "$priorityStats",
                    avgCompletionTime: { $arrayElemAt: ["$avgCompletionTime.avgTime", 0] }
                }
            }
        ];

        const result = await Task.aggregate(pipeline);

        if (!result || result.length === 0) {
            throw new Error('No tasks found for this user');
        }

        const stats = result[0];

        return {
            total_count: stats.totalCount || 0,
            completed_percentage: stats.completedPercentage || 0,
            pending_percentage: stats.pendingPercentage || 0,
            time_lapsed: (stats.timeLapsed / (1000 * 60 * 60)).toFixed(2), // Convert ms to hours
            time_left: (stats.timeLeft / (1000 * 60 * 60)).toFixed(2), // Convert ms to hours
            priority_times: stats.priorityTimes,
            average_completion_time: stats.avgCompletionTime ? stats.avgCompletionTime.toFixed(2) : 0
        };
    };



}
