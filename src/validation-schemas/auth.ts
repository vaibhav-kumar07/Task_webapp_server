import { z } from 'zod';

// Register Validation Schema
export const registerSchema = z.object({
    name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Login Validation Schema
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().nonempty("Password is required"),
});
