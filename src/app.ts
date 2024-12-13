import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectToDb, disconnectFromDb } from './common/db-connection';
import CommonVariables from './common/common-variables';
import { defaultErrorHandler } from './middlerwares/error-middleware';
import taskRoutes from "./routes/task-routes"
import authRoutes from "./routes/auth-routes"
// Initialize environment variables
dotenv.config();
CommonVariables.init();

// Create the Express app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());


// Connect to MongoDB
(async () => {
    try {
        await connectToDb();
    } catch (error) {
        console.error('Failed to connect to the database', error);
        process.exit(1);
    }
})();



// Health check route
app.get('/', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const response = {
        message: 'Welcome to Task Backend Service',
        environment: CommonVariables.NODE_ENV,
        service: CommonVariables.APP_SERVICE_NAME,
    };
    res.json(response);
});

app.use("/api/auth", authRoutes)
app.use('/api/tasks', taskRoutes);
// Error handling middleware
app.use(defaultErrorHandler);

// Graceful shutdown on exit
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await disconnectFromDb();
    process.exit(0);
});

// Start the server
const PORT = CommonVariables.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
