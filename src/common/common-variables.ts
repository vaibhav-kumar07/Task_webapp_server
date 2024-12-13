export default class CommonVariables {
    static PORT: string;
    static MONGO_URI: string | undefined;
    static MONGO_DB_NAME: string;
    static MONGO_TIMEOUT: string | number;
    static NODE_ENV: string;
    static APP_SERVICE_NAME: string | undefined;
    static ACCESS_TOKEN_SECRET: string | undefined;
    static USER_TOKEN_TIMEOUT: string | undefined

    static getAccessTokenSecret = () => {
        const secret = CommonVariables.ACCESS_TOKEN_SECRET;
        if (!secret) {
            throw new Error('Access token secret not found');
        }
        return secret;
    };

    static init() {
        console.log('Common Variables Initialized');
        CommonVariables.PORT = process.env.PORT || '6001';
        CommonVariables.MONGO_URI = process.env.MONGO_URI;
        CommonVariables.MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'Service';
        CommonVariables.MONGO_TIMEOUT = process.env.MONGO_TIMEOUT || 10000;
        CommonVariables.NODE_ENV = process.env.NODE_ENV || 'development';
        CommonVariables.APP_SERVICE_NAME = process.env.APP_SERVICE_NAME;
        CommonVariables.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
        CommonVariables.USER_TOKEN_TIMEOUT = process.env.USER_TOKEN_TIMEOUT || "2h";
    }
}