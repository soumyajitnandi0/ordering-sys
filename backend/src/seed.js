"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Product_1 = __importDefault(require("./models/Product"));
dotenv_1.default.config();
const products = [
    { name: 'Classic Waffle', price: 100, category: 'Waffles' },
    { name: 'Chocolate Waffle', price: 120, category: 'Waffles' },
    { name: 'Oreo Waffle', price: 140, category: 'Waffles' },
    { name: 'Nutella Waffle', price: 150, category: 'Waffles' },
    { name: 'Brownie Waffle', price: 160, category: 'Waffles' },
    { name: 'Strawberry Waffle', price: 130, category: 'Waffles' },
    { name: 'Vanilla Shake', price: 80, category: 'Shakes' },
    { name: 'Chocolate Shake', price: 90, category: 'Shakes' },
    { name: 'Oreo Shake', price: 110, category: 'Shakes' },
    { name: 'Cold Coffee', price: 80, category: 'Drinks' },
    { name: 'French Fries', price: 70, category: 'Fries' },
    { name: 'Cheese Fries', price: 100, category: 'Fries' },
];
async function seed() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/waffle-circle');
        console.log('Connected to DB');
        await Product_1.default.deleteMany({});
        console.log('Cleared existing products');
        await Product_1.default.insertMany(products);
        console.log('Inserted products');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding data', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map