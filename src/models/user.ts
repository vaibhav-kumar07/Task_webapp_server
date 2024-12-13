import mongoose, { Schema } from 'mongoose';
import { IUser } from "../interfaces/user"


const userSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

}, {
    collection: "user"
});

export default mongoose.model<IUser>('User', userSchema);
