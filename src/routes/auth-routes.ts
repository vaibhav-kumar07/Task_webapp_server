import express from 'express';
import * as authHandler from '../handlers/auth-handler';
import { authorizer } from '../middlerwares/auth-middleware';

const router = express.Router();

// Registration Route (Sign Up)
router.post('/register', authHandler.register);

// Login Route (Sign In)
router.post('/login', authHandler.login);

// Logout Route (Log Out)
router.post('/logout', authHandler.logout);

router.get("/validate", authorizer)

export default router;
