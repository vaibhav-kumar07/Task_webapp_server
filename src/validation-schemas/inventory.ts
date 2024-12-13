import { z } from 'zod';

export const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid ID format' });

export const createItemSchema = z.object({
    name: z.string().min(1),
    dateReceived: z.string(),
    recievedQuantity: z.number().min(1),
    qrCode: z.string().min(1),

});

export const updateItemSchema = createItemSchema.partial();

export const updateQuanitySchema = z.object({
    id: idSchema,
    quantity: z.number().min(1),
});