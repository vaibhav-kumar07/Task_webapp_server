import jwt, { JwtPayload } from 'jsonwebtoken';
import CommonVariables from '../common/common-variables';

// Generate JWT token with expiration (default: 2 hours)
export const generateToken = (userId: string): string => {
    return jwt.sign({ _id: userId }, CommonVariables.getAccessTokenSecret(), {
        expiresIn: CommonVariables.USER_TOKEN_TIMEOUT,
    });
};

// Verify a token's validity and decode its payload
export const verifyToken = (token: string): JwtPayload | string => {
    try {
        return jwt.verify(token, CommonVariables.getAccessTokenSecret());
    } catch (error) {
        throw new Error('Invalid or expired token.');
    }
};

// Check if a token is expired
export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwt.decode(token) as JwtPayload;

        // Ensure token has an `exp` property (expiration time in seconds)
        if (!decoded || !decoded.exp) {
            throw new Error('Invalid token format.');
        }

        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        return currentTime > decoded.exp;
    } catch (error) {
        throw new Error('Error while checking token expiration: ');
    }
};

// Decode a token to extract its payload without verifying its signature
export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch (error) {
        throw new Error('Error while decoding token: ');
    }
};
