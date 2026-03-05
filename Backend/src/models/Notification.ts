import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    organizationId?: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'payment' | 'material' | 'system';
    isRead: boolean;
    metadata?: any;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['payment', 'material', 'system'], default: 'system' },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
