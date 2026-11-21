# Inventory and Data Management System

A RESTful backend for managing a store or warehouse product catalogue. It supports creating products, updating stock levels, searching and filtering the catalogue, and generating inventory reports using MongoDB aggregation pipelines.

**Course:** Web Development III | **Unit:** 3 | **Assignment:** 3

## Features

- Mongoose schema with field-level validation (required fields, min/max, unique SKU, whole-number quantity)
- Full CRUD for products
- Filtering, sorting, searching and pagination using query strings
- Safe stock adjustment (restock and sale) that never lets quantity go below 0
- Low-stock alert report (aggregation)
- Category-wise inventory summary (aggregation)
- Centralized error handling and a custom `AppError` class
- Environment variables managed with dotenv

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv

## Project Structure

```
inventory-system/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   └── productController.js   # All product logic
├── middleware/
│   ├── asyncHandler.js        # Wraps async routes
│   └── errorHandler.js        # Centralized error handling
├── models/
│   └── Product.js             # Mongoose schema
├── routes/
│   └── productRoutes.js       # API routes
├── utils/
│   └── AppError.js            # Custom error class
├── seed.js                    # Adds 12 sample products
├── server.js                  # App entry point
├── .env                       # Environment variables (not on GitHub)
└── package.json
```

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd inventory-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Create a file named `.env` in the project root:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventoryDB
```

If you use MongoDB Atlas, paste your Atlas connection string as `MONGO_URI`.

### 4. Start the server

```bash
npm run dev
```

You should see:

```
MongoDB connected
Server running on http://localhost:5000
```

### 5. (Optional) Add sample data

In a second terminal:

```bash
node seed.js
```

This adds 12 sample products across 5 categories (Electronics, Apparel, Furniture, Stationery, Groceries). Running it again clears the old products first.

## Product Schema

| Field | Type | Rules |
|---|---|---|
| `name` | String | Required, 2 to 100 characters |
| `sku` | String | Required, unique, stored in uppercase |
| `category` | String | Required |
| `price` | Number | Required, cannot be negative |
| `quantity` | Number | Required, whole number, cannot be negative, default 0 |
| `reorderLevel` | Number | Default 10, cannot be negative |
| `supplier` | String | Optional |
| `stockValue` | Virtual | Calculated as `price × quantity` (not stored) |

Timestamps (`createdAt`, `updatedAt`) are added automatically.

## API Endpoints

Base URL: `http://localhost:5000/api/products`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a product |
| GET | `/` | Get all products (filter, sort, paginate) |
| GET | `/:id` | Get a single product |
| PUT | `/:id` | Update product details |
| PATCH | `/:id/stock` | Adjust stock (restock or sale) |
| DELETE | `/:id` | Delete a product |
| GET | `/low-stock` | Products at or below their reorder level |
| GET | `/summary` | Category-wise inventory summary |

### Query parameters for `GET /api/products`

| Parameter | Example | Description |
|---|---|---|
| `category` | `?category=Furniture` | Filter by category (case-insensitive) |
| `search` | `?search=pen` | Search in product name |
| `minPrice`, `maxPrice` | `?minPrice=100&maxPrice=1000` | Filter by price range |
| `sort` | `?sort=-price` | Sort by a field (`-` for descending) |
| `page` | `?page=2` | Page number (default 1) |
| `limit` | `?limit=5` | Items per page (default 10, max 100) |

Example combining them:

```
GET /api/products?category=Furniture&sort=-price&page=1&limit=5
```

## Example Requests

**Create a product**

```
POST /api/products
```

```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

**Update product details**

```
PUT /api/products/:id
```

```json
{ "price": 140, "quantity": 60 }
```

**Restock (positive number) or sale (negative number)**

```
PATCH /api/products/:id/stock
```

```json
{ "change": 10 }
```

A sale larger than the available stock returns `400 Insufficient stock`.

## Error Responses

All errors use the same format:

```json
{
  "success": false,
  "message": "Product not found"
}
```

| Status | When |
|---|---|
| 400 | Validation failed, invalid ID format, or insufficient stock |
| 404 | Product or route not found |
| 409 | Duplicate SKU |
| 500 | Unexpected server error |

## Author

**Akanksha Kumari**
B.Tech Computer Science and Engineering, K. R. Mangalam University
GitHub: [akanksha-076](https://github.com/akanksha-076)
