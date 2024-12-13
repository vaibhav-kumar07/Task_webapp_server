import mongoose, { Schema, Document, Collection } from 'mongoose';
import { IInventoryItem, IInventoryItemStatus } from '../interfaces/inventoryItem';

const InventoryItemSchema: Schema = new Schema<IInventoryItem>({

    name: { type: String, required: true },
    dateReceived: { type: String, required: true },
    dateDispatched: { type: String },
    recievedQuantity: { type: Number, required: true },
    dispachedQuantity: { type: Number, default: 0, required: true },
    availableQuantity: { type: Number },
    qrCode: { type: String, required: true },
    status: {
        type: String, enum: (IInventoryItemStatus), required: true, default: IInventoryItemStatus.Pending
    }
}, { timestamps: true, collection: "inventory" });

export default mongoose.model<IInventoryItem>('Inventory', InventoryItemSchema);
