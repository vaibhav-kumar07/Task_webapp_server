import { Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/auth-controller';
const authController = new AuthController();


export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        console.log("api registration is called with name", name, email, password);
        const { token } = await authController.register({ name: name, email: email, password: password });
        res.status(201).json({ message: 'User Registered successfully', token });
    } catch (error) {
        next(error);
    }
};


export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const { token } = await authController.login(email, password);
        res.status(200).json({ message: 'Login successfull', token });
    } catch (error) {
        next(error);
    }
};


export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authController.logout();
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};
