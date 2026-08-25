import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  tokenNumber: number;
  tokenDate: string;
  items: IOrderItem[];
  subtotal: number;
  total: number;
  status: 'NEW' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  preparingAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

const OrderItemSchema: Schema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema(
  {
    tokenNumber: { type: Number, required: true },
    tokenDate: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['NEW', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
      default: 'NEW',
    },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
