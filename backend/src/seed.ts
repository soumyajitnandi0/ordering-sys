import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product';

dotenv.config();

const products = [
  // MINION WAFFLES
  { name: 'Milk Chocolate', price: 69, category: 'MINION WAFFLES' },
  { name: 'White Chocolate', price: 69, category: 'MINION WAFFLES' },
  { name: 'Dark Chocolate', price: 69, category: 'MINION WAFFLES' },
  { name: 'Triple Chocolate', price: 79, category: 'MINION WAFFLES' },

  // SIGNATURE WAFFLES
  { name: 'Dual Fantasy (Any 2)', price: 129, category: 'SIGNATURE WAFFLES', isCustomizable: true, maxSelections: 2, customizationOptions: [{name: 'Milk Chocolate', extraPrice: 0}, {name: 'White Chocolate', extraPrice: 0}, {name: 'Dark Chocolate', extraPrice: 0}] },
  { name: 'Triple Chocolate', price: 139, category: 'SIGNATURE WAFFLES' },
  { name: 'Chocolate Overload (Milk/White/Dark)', price: 139, category: 'SIGNATURE WAFFLES', isCustomizable: true, maxSelections: 1, customizationOptions: [{name: 'Milk Chocolate', extraPrice: 0}, {name: 'White Chocolate', extraPrice: 0}, {name: 'Dark Chocolate', extraPrice: 0}] },
  { name: 'KitKat Crunch', price: 149, category: 'SIGNATURE WAFFLES' },
  { name: 'Oreo Delight', price: 149, category: 'SIGNATURE WAFFLES' },
  { name: 'Naughty Nutella', price: 169, category: 'SIGNATURE WAFFLES' },
  { name: 'Golden Biscoff', price: 169, category: 'SIGNATURE WAFFLES' },
  { name: 'KitKat Nutella', price: 179, category: 'SIGNATURE WAFFLES' },
  { name: 'Flirty Rocher', price: 199, category: 'SIGNATURE WAFFLES' },

  // STICK WAFFLES
  { name: 'Twin Fantasy (Any 2)', price: 139, category: 'STICK WAFFLES', isCustomizable: true, maxSelections: 2, customizationOptions: [{name: 'Milk Chocolate', extraPrice: 0}, {name: 'White Chocolate', extraPrice: 0}, {name: 'Dark Chocolate', extraPrice: 0}] },
  { name: 'Choco Triangle', price: 149, category: 'STICK WAFFLES' },
  { name: 'Chocolate Overload (Milk/White/Dark)', price: 149, category: 'STICK WAFFLES', isCustomizable: true, maxSelections: 1, customizationOptions: [{name: 'Milk Chocolate', extraPrice: 0}, {name: 'White Chocolate', extraPrice: 0}, {name: 'Dark Chocolate', extraPrice: 0}] },
  { name: 'Klassy KitKat', price: 159, category: 'STICK WAFFLES' },
  { name: 'Midnight Oreo', price: 159, category: 'STICK WAFFLES' },
  { name: 'Dreamy Nutella', price: 179, category: 'STICK WAFFLES' },
  { name: 'Naked Biscoff', price: 179, category: 'STICK WAFFLES' },
  { name: 'Nutellian KitKat', price: 189, category: 'STICK WAFFLES' },
  { name: 'Ferrero Rizz', price: 219, category: 'STICK WAFFLES' },

  // WAFFLE PIZZA
  { name: 'B&W Pizza', price: 249, category: 'WAFFLE PIZZA' },
  { name: 'Twin Pizza (Any 2)', price: 249, category: 'WAFFLE PIZZA' },
  { name: '4 in 1 Pizza', price: 269, category: 'WAFFLE PIZZA' },
  { name: 'Royal DLX Pizza', price: 349, category: 'WAFFLE PIZZA' },

  // HERO SECTION
  { name: 'Strawberry Chocolate', price: 149, category: 'HERO SECTION' },
  { name: 'Triple Chocolate Bowl', price: 219, category: 'HERO SECTION' },
  { name: 'Waffle Chaat', price: 199, category: 'HERO SECTION' },

  // BOBA MOCKTAILS
  { name: 'Mango Boba Mocktail', price: 149, category: 'BOBA MOCKTAILS', isCustomizable: true, maxSelections: 1, customizationOptions: [{name: 'Water', extraPrice: 0}, {name: 'Soda', extraPrice: 10}] },
  { name: 'Strawberry Boba Mocktail', price: 149, category: 'BOBA MOCKTAILS', isCustomizable: true, maxSelections: 1, customizationOptions: [{name: 'Water', extraPrice: 0}, {name: 'Soda', extraPrice: 10}] },

  // ADD-ONS
  { name: 'Sprinkler', price: 10, category: 'ADD-ONS' },
  { name: 'Extra Chocolate', price: 10, category: 'ADD-ONS', isCustomizable: true, maxSelections: 1, customizationOptions: [{name: 'Milk Chocolate', extraPrice: 0}, {name: 'White Chocolate', extraPrice: 0}, {name: 'Dark Chocolate', extraPrice: 0}] },
  { name: 'KitKat', price: 15, category: 'ADD-ONS' },
  { name: 'Choco Chips', price: 15, category: 'ADD-ONS', isCustomizable: true, maxSelections: 1, customizationOptions: [{name: 'Dark Chips', extraPrice: 0}, {name: 'White Chips', extraPrice: 0}, {name: 'Twin Chips', extraPrice: 0}] },
  { name: 'Choco Stick', price: 15, category: 'ADD-ONS' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/waffle-circle');
    console.log('Connected to DB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    await Product.insertMany(products);
    console.log('Inserted products');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data', error);
    process.exit(1);
  }
}

seed();
