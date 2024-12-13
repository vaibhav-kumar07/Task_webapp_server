export class AppError extends Error {
    error_type: string;
    statusCode: number;
    isOperational: boolean;
    errors: Array<{ field: string; value: string }> | string[];

    constructor(
        error_type: string,
        message: string = "An error occurred",
        statusCode: number = 500,
        errors: Array<{ field: string; value: string }> | string[] = []
    ) {
        super(message);
        this.error_type = error_type;
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}
