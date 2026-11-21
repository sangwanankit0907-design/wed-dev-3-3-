const express = require("express");
const c = require("../controllers/productController");

const router = express.Router();

// Fixed paths MUST come before "/:id", otherwise Express treats "low-stock" as an id
router.get("/low-stock", c.getLowStock);
router.get("/summary", c.getSummary);

router.route("/").get(c.getProducts).post(c.createProduct);
router.route("/:id").get(c.getProductById).put(c.updateProduct).delete(c.deleteProduct);
router.patch("/:id/stock", c.adjustStock);

module.exports = router;