import mongoose from 'mongoose';
import CommonVariables from './common-variables';

export async function connectToDb(): Promise<boolean | undefined> {
    const MONGO_URI = CommonVariables.MONGO_URI;
    const MONGO_DB_NAME = CommonVariables.MONGO_DB_NAME;
    const MONGO_TIMEOUT = CommonVariables.MONGO_TIMEOUT;

    if (!MONGO_URI) {
        throw new Error('MONGO_URI and MONGO_DB_NAME is required');
    }

    if (!MONGO_DB_NAME) {
        console.log('MONGO_DB_NAME is not provided.');
    }

    console.log(
        `Connecting to MongoDB, URI: ${MONGO_URI}, DataBase: ${MONGO_DB_NAME}`,
    );

    try {
        await mongoose.connect(MONGO_URI, {
            dbName: MONGO_DB_NAME,
            minPoolSize: 5,
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: Number(MONGO_TIMEOUT),
        });

        console.log('Connected to server successfully');
        return true;
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}

export async function disconnectFromDb(): Promise<void> {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB', error);
    }
}