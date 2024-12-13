import User from '../models/user';
import { IUser } from '../interfaces/user';
import { generateToken } from '../utils/jwt-utils';
import { HashedPassword, ComparePassword } from '../utils/bcrypt-utils';
import { throwBusinessError } from '../utils/error-utils';

export default class AuthService {

    private async save(userInput: Partial<IUser>, isNew: boolean = true): Promise<IUser> {
        const user = new User(userInput);
        user.isNew = isNew;
        return (await user.save()).toObject();
    }



    public async register({ name, email, password }: { name: string; email: string; password: string }): Promise<{ _id: string; token: string }> {
        const existingUser = await User.findOne({ email });
        throwBusinessError(!!existingUser, 'User already exists with this email.');
        const hashedPassword = await HashedPassword(password);
        const newUserInput: IUser = {
            name: name,
            email: email,
            password: hashedPassword,
        };
        const savedUser = await this.save(newUserInput);
        const token = generateToken(savedUser._id as string);
        return { _id: savedUser._id as string, token };
    }


    public async login(email: string, password: string): Promise<{ token: string }> {
        const user = await User.findOne({ email });
        throwBusinessError(!user, "User does not exist");
        const isPasswordValid = await ComparePassword(password, user!.password);
        throwBusinessError(!isPasswordValid, 'Invalid credentials.');
        const token = generateToken(user!._id!.toString());
        return { token };
    }

    public async getById(id: string): Promise<IUser> {
        const user = await User.findById(id).lean();
        throwBusinessError(!user, 'User not found.');
        return user!;
    }


    public async logout(): Promise<{ message: string }> {
        return { message: 'Logged out successfully.' };
    }
}
