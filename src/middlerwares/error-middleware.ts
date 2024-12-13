
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errros/app-error';
import { error_type } from '../utils/error-utils';

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        console.log("ApprErrrror", err)
        const errorType = err.error_type === error_type.validationError ? error_type.validationError : error_type.businessError;
        res.status(err.statusCode).json({
            error_type: errorType,
            message: err.message,
            errors: err.errors || null,
        });
    } else {
        res.status(500).json({
            error_type: 'server_error',
            message: 'An unexpected error occurred',
        });
    }
};
