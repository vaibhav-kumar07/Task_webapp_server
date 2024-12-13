
import { Request, Response, NextFunction } from 'express';
import taskController from '../controllers/task-controller';
import { IUser } from '../interfaces/user';
const TaskController = new taskController()

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: IUser = req.body.loggedInUser
        const createdItem = await TaskController.create(req.body, user);
        res.status(201).json({ message: 'Task created successfully', data: createdItem });
    } catch (error) {
        next(error);
    }
}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination = req.query.pagination || {};
        const items = await TaskController.get(pagination);
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: IUser = req.body.loggedInUser
        const item = await TaskController.getById(req.params.id, user);
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedItem = await TaskController.update(req.params.id, req.body);
        res.status(200).json({ message: 'Item updated successfully', data: updatedItem });
    } catch (error) {
        next(error);
    }
};

export const stats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: IUser = req.body.loggedInUser
        const updatedItem = await TaskController.getStats(user);
        res.status(200).json({ message: 'Item updated successfully', data: updatedItem });
    } catch (error) {
        next(error);
    }
};
