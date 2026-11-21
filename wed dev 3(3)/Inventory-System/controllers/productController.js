const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middleware/asyncHandler");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// CREATE
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// READ ALL: filter + sort + paginate
// e.g. /api/products?category=Furniture&minPrice=100&sort=-price&page=2&limit=5
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, search, sort, page, limit } = req.query;

  const filter = {};
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
  if (search) filter.name = new RegExp(escapeRegex(search), "i");
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortBy = sort ? sort.split(",").join(" ") : "-createdAt";
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortBy)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    count: products.length,
    products,
  });
});

// READ ONE
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);
  res.json(product);
});

// UPDATE details
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,           // return the updated document
    runValidators: true, // apply schema rules on update too
  });
  if (!product) throw new AppError("Product not found", 404);
  res.json(product);
});

// DELETE
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError("Product not found", 404);
  res.json({ message: "Product deleted", id: product._id });
});

// STOCK ADJUSTMENT: PATCH /:id/stock  body: { "change": 10 } or { "change": -3 }
exports.adjustStock = asyncHandler(async (req, res) => {
  const change = Number(req.body.change);
  if (!Number.isInteger(change) || change === 0) {
    throw new AppError("'change' must be a non-zero whole number", 400);
  }

  // Atomic update: only succeeds if stock won't go below 0
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, quantity: { $gte: -change } },
    { $inc: { quantity: change } },
    { new: true }
  );

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    if (!exists) throw new AppError("Product not found", 404);
    throw new AppError("Insufficient stock for this sale", 400);
  }

  res.json({ message: "Stock updated", product });
});

// AGGREGATION 1: low-stock report (quantity <= reorderLevel)
exports.getLowStock = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.aggregate([
    { $match: { $expr: { $lte: ["$quantity", "$reorderLevel"] } } },
    { $addFields: { stockValue: { $multiply: ["$price", "$quantity"] } } },
    { $sort: { quantity: 1 } },
  ]);
  res.json({ count: lowStockItems.length, lowStockItems });
});

// AGGREGATION 2: category-wise summary
exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
        avgPrice: { $avg: "$price" },
      },
    },
    { $sort: { totalStockValue: -1 } },
  ]);
  res.json({ categories: summary.length, summary });
});