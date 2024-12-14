
import { ITask, ITaskStatus } from '../interfaces/task';
import mongoose, { Schema } from 'mongoose';


const TaskSchema: Schema = new Schema<ITask>(
    {

        title: { type: String, required: true, unique: true },
        start_time: { type: Date, required: true },
        end_time: { type: Date, required: true },
        priority: {
            type: String,
            required: true

        },
        status: {
            type: String,
            enum: Object.values(ITaskStatus),
            default: ITaskStatus.PENDING,
            required: true,
        },
        completion_time: {
            type: Number,
            required: true
        },
        created_at: { type: Date, required: true, default: Date.now },
        created_by: { type: String, required: true },
        updated_at: { type: Date, required: true, default: Date.now },
        updated_by: { type: String, required: true },
    },
    {
        collection: "task"
    }
);

export default mongoose.model<ITask>('Task', TaskSchema);
