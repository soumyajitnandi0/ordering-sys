import mongoose, { Document } from 'mongoose';
export interface ICounter extends Document {
    _id: string;
    sequence: number;
    date: string;
}
declare const _default: mongoose.Model<ICounter, {}, {}, {}, Document<unknown, {}, ICounter, {}, mongoose.DefaultSchemaOptions> & ICounter & Required<{
    _id: string;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICounter>;
export default _default;
//# sourceMappingURL=Counter.d.ts.map