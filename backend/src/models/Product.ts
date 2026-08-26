import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  sortOrder?: number;
  isCustomizable?: boolean;
  customizationOptions?: { name: string; extraPrice: number }[];
  maxSelections?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String },
    available: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    isCustomizable: { type: Boolean, default: false },
    customizationOptions: [{
      name: { type: String, required: true },
      extraPrice: { type: Number, default: 0 }
    }],
    maxSelections: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
