import { ITask, ITaskStatus } from '../interfaces/task';
import { IUser } from '../interfaces/user';
import Task from '../models/task'; // Import the GMT conversion utility
import { calculateCompletionTimeInHours } from '../utils/date-utils';
import { throwBusinessError } from '../utils/error-utils';
import { parseFilters } from '../utils/filter-utils';
import { applyPagination, applySort } from '../utils/pagination-sort-utils';
import { PipelineStage } from 'mongoose';

export default class TaskService {

    private async save(input: Partial<ITask>, isNew: boolean = true): Promise<ITask> {
        const task = new Task(input);
        task.isNew = isNew;
        return (await task.save()).toObject();
    }

    // Create a new task
    public async create(taskData: Partial<ITask>, user: IUser): Promise<ITask> {
        const existingTask = await Task.findOne({ title: taskData.title, start_time: taskData.start_time });

        throwBusinessError(!!existingTask, 'A task with the same title and start time already exists');

        taskData.created_by = user.email
        taskData.updated_by = user.email
        taskData!.completion_time = calculateCompletionTimeInHours(taskData.start_time as string, taskData.end_time as string);
        // Use save to create the new task
        return (await this.save(taskData, true))
    }

    // Update an existing task
    public async update(id: string, taskData: Partial<ITask>): Promise<ITask> {
        const existingTask = await Task.findById(id);


        throwBusinessError(!existingTask, 'Task not found for update');
        if (!existingTask) {
            throw new Error('Task not found');
        }

        if (taskData.start_time) {
            taskData.start_time = taskData.start_time as string
        }
        if (taskData.end_time) {
            taskData.end_time = taskData.end_time as string
        }
        taskData!.completion_time = calculateCompletionTimeInHours(taskData.start_time as string, taskData.end_time as string);
        // Merge the existing task's data with the new data and use save for update
        const updatedTask = { ...existingTask.toObject(), ...taskData, updated_at: new Date() };
        return await this.save(updatedTask, false);
    }


    public async get(filters: any, pagination: any, sort: any, searchText: string): Promise<any> {
        const { limit, skip } = applyPagination(pagination);
        const criteria = { ...parseFilters(filters) };
        if (searchText) {
            criteria.$or = [
                { title: { $regex: searchText, $options: 'i' } }
            ];
        }
        const sortObj = applySort(sort);
        const tasksList = await Task.find(criteria)
            .sort(sortObj as any)
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

    getStats = async (user: IUser) => {
        const pipeline: PipelineStage[] = [
            {
                $match: { created_by: user.email },
            },
            {
                $facet: {
                    totalTasks: [{ $count: "total" }],
                    completedTasks: [
                        { $match: { status: ITaskStatus.FINISHED } },
                        { $count: "totalCompleted" },
                    ],
                    pendingTasks: [
                        { $match: { status: ITaskStatus.PENDING } },
                        {
                            $group: {
                                _id: null,
                                pendingCount: { $sum: 1 },
                                totalTimeLapsed: {
                                    $sum: {
                                        $cond: {
                                            if: { $and: [{ $ne: ["$start_time", null] }, { $lt: ["$start_time", "$$NOW"] }] },
                                            then: { $subtract: ["$$NOW", "$start_time"] },
                                            else: 0,
                                        },
                                    },
                                },
                                totalEstimatedTime: {
                                    $sum: {
                                        $cond: {
                                            if: { $and: [{ $ne: ["$start_time", null] }, { $ne: ["$end_time", null] }] },
                                            then: { $subtract: ["$end_time", "$start_time"] },
                                            else: 0,
                                        },
                                    },
                                },
                            },
                        },
                    ],
                    priorityStats: [
                        { $match: { status: ITaskStatus.PENDING } },
                        {
                            $group: {
                                _id: "$priority",
                                pendingCount: { $sum: 1 },
                                timeLapsed: {
                                    $sum: {
                                        $cond: {
                                            if: { $and: [{ $ne: ["$start_time", null] }, { $lt: ["$start_time", "$$NOW"] }] },
                                            then: { $subtract: ["$$NOW", "$start_time"] },
                                            else: 0,
                                        },
                                    },
                                },
                                estimatedTimeToFinish: {
                                    $sum: {
                                        $cond: {
                                            if: { $and: [{ $ne: ["$start_time", null] }, { $ne: ["$end_time", null] }] },
                                            then: { $subtract: ["$end_time", "$start_time"] },
                                            else: 0,
                                        },
                                    },
                                },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ],
                    avgCompletionTime: [
                        { $match: { status: ITaskStatus.FINISHED } },
                        {
                            $project: {
                                completionTime: {
                                    $divide: [
                                        { $subtract: ["$end_time", "$start_time"] },
                                        1000 * 60 * 60, // Convert to hours
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                averageTime: { $avg: "$completionTime" },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    total_tasks: { $arrayElemAt: ["$totalTasks.total", 0] },
                    completed_percentage: {
                        $multiply: [
                            {
                                $divide: [
                                    { $arrayElemAt: ["$completedTasks.totalCompleted", 0] },
                                    { $arrayElemAt: ["$totalTasks.total", 0] },
                                ],
                            },
                            100,
                        ],
                    },
                    pending_percentage: {
                        $multiply: [
                            {
                                $divide: [
                                    { $arrayElemAt: ["$pendingTasks.pendingCount", 0] },
                                    { $arrayElemAt: ["$totalTasks.total", 0] },
                                ],
                            },
                            100,
                        ],
                    },
                    pending_summary: {
                        pending_tasks: { $arrayElemAt: ["$pendingTasks.pendingCount", 0] },
                        total_time_lapsed: {
                            $divide: [
                                { $arrayElemAt: ["$pendingTasks.totalTimeLapsed", 0] },
                                1000 * 60 * 60, // Convert to hours
                            ],
                        },
                        total_time_estimated: {
                            $divide: [
                                { $arrayElemAt: ["$pendingTasks.totalEstimatedTime", 0] },
                                1000 * 60 * 60, // Convert to hours
                            ],
                        },
                    },
                    priority_stats: {
                        $map: {
                            input: "$priorityStats",
                            as: "priority",
                            in: {
                                _id: "$$priority._id",
                                pendingCount: "$$priority.pendingCount",
                                timeLapsed: {
                                    $divide: [
                                        "$$priority.timeLapsed",
                                        1000 * 60 * 60, // Convert timeLapsed to hours
                                    ],
                                },
                                estimatedTimeToFinish: {
                                    $divide: [
                                        "$$priority.estimatedTimeToFinish",
                                        1000 * 60 * 60, // Convert estimatedTimeToFinish to hours
                                    ],
                                },
                            },
                        },
                    },
                    average_completion_time: {
                        $arrayElemAt: ["$avgCompletionTime.averageTime", 0],
                    },
                },
            },
        ];

        const result = await Task.aggregate(pipeline);
        return result[0] || {};
    };



}
