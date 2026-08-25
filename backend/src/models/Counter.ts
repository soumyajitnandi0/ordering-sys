import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document<string> {
  _id: string;
  sequence: number;
  date: string; // Format: YYYY-MM-DD
}

const CounterSchema: Schema = new Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 },
  date: { type: String, required: true },
});

export default mongoose.model<ICounter>('Counter', CounterSchema);
