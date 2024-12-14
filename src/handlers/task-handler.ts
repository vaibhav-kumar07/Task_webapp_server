
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
        const filters = req.query.filters || {};
        const pagination = req.query.pagination || {};
        let sort = req.query.sort as string;
        if (!sort) {
            sort = 'start_time:desc';
        }
        const searchText = req.query.searchText as string || '';
        const items = await TaskController.get(filters, pagination, sort, searchText);
        res.status(200).json(items);
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
export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedItem = await TaskController.delete(req.params.id);
        res.status(200).json({ message: 'Item updated successfully', data: updatedItem });
    } catch (error) {
        next(error);
    }
};

export const stats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("stats api hitted")
        const user: IUser = req.body.loggedInUser
        const updatedItem = await TaskController.getStats(user);
        res.status(200).json({ message: 'Item updated successfully', data: updatedItem });
    } catch (error) {
        next(error);
    }
};
