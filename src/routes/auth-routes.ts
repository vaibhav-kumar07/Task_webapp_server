import express from 'express';
import * as authHandler from '../handlers/auth-handler';

const router = express.Router();

// Registration Route (Sign Up)
router.post('/register', authHandler.register);

// Login Route (Sign In)
router.post('/login', authHandler.login);

// Logout Route (Log Out)
router.post('/logout', authHandler.logout);

export default router;
