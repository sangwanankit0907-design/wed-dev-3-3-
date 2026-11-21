require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  // Electronics (4)
  { name: "Wireless Mouse", sku: "ELEC-MS-101", category: "Electronics", price: 799, quantity: 30, reorderLevel: 10, supplier: "Logitech India" },
  { name: "Bluetooth Speaker", sku: "ELEC-SP-102", category: "Electronics", price: 2499, quantity: 3, reorderLevel: 8, supplier: "boAt" },
  { name: "Smartphone", sku: "ELEC-PH-103", category: "Electronics", price: 15999, quantity: 20, reorderLevel: 5, supplier: "Samsung India" },
  { name: "Laptop", sku: "ELEC-LP-104", category: "Electronics", price: 54999, quantity: 4, reorderLevel: 5, supplier: "HP India" },
  // Apparel (2)
  { name: "Cotton T-Shirt", sku: "APRL-TS-201", category: "Apparel", price: 499, quantity: 50, reorderLevel: 15, supplier: "Allen Solly" },
  { name: "Denim Jeans", sku: "APRL-JN-202", category: "Apparel", price: 1999, quantity: 28, reorderLevel: 10, supplier: "Levis India" },
  // Furniture (2)
  { name: "Study Table", sku: "FURN-TB-812", category: "Furniture", price: 3999, quantity: 2, reorderLevel: 4, supplier: "IKEA India" },
  { name: "Office Chair", sku: "FURN-CH-813", category: "Furniture", price: 5499, quantity: 12, reorderLevel: 5, supplier: "Godrej Interio" },
  // Stationery (2)
  { name: "Gel Pen Pack of 15", sku: "STNY-PN-713", category: "Stationery", price: 120, quantity: 40, reorderLevel: 20, supplier: "Cello Pens" },
  { name: "A4 Notebook", sku: "STNY-NB-714", category: "Stationery", price: 80, quantity: 15, reorderLevel: 25, supplier: "Classmate" },
  // Groceries (2)
  { name: "Basmati Rice 5kg", sku: "GROC-RC-901", category: "Groceries", price: 650, quantity: 60, reorderLevel: 20, supplier: "India Gate" },
  { name: "Olive Oil 1L", sku: "GROC-OL-902", category: "Groceries", price: 899, quantity: 6, reorderLevel: 10, supplier: "Figaro" },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({}); // clears old products so you can re-run safely
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
})();