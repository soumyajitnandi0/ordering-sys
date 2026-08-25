import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IOrder, {}, {}, {}, Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
export default _default;
//# sourceMappingURL=Order.d.ts.map