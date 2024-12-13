import { Request, Response, NextFunction } from 'express';
import { verifyToken, isTokenExpired } from '../utils/jwt-utils'; // Import token utilities
import AuthService from '../services/auth-service';

const authService = new AuthService();

export const authorizer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;
        // Check if the Authorization header is present
        if (!authorization) {
            return res.status(401).json({ message: 'No authorization header provided. Please login again.' });
        }

        // Extract the token from the Authorization header (Bearer <token>)
        const [_, token] = authorization.split(' ');
        if (!token) {
            return res.status(401).json({ message: 'No token. Please login again.' });
        }

        // Check if the token is expired
        if (isTokenExpired(token)) {
            return res.status(401).json({ message: 'Token has expired. Please login again.' });
        }

        // Verify the token's validity and extract the payload
        const payload: any = verifyToken(token);
        if (!payload || !payload._id) {
            return res.status(401).json({ message: 'Invalid token. Please login again.' });
        }

        // Check if the user exists in the database
        const user = await authService.getById(payload._id);
        if (!user) {
            return res.status(401).json({ message: 'User not found. Please login again.' });
        }

        // Attach the authenticated user to the request object
        req.body.loggedInUser = user;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error in authorizer middleware:', error);
        return res.status(500).json({ message: 'Internal server error during authorization.' });
    }
};
