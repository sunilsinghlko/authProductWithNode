const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authenticate = require("../middleware/authMiddleware");

// Route to create a new product (requires authentication)
router.post("/create", authenticate, productController.createProduct);

// Route to get all products (public access)
router.get("/", productController.getAllProducts);

// Route to get a single product by ID (public access)
router.get("/:id", productController.getProductById);

// Route to update a product by ID (requires authentication)
router.put("/:id", authenticate, productController.updateProduct);

// Route to delete a product by ID (requires authentication)
router.delete("/:id", authenticate, productController.deleteProduct);

// Route to search products by name or ID (requires authentication)
router.get("/search", authenticate, productController.searchProducts);

// Route to download selected products in Excel format (requires authentication)
router.post("/download", authenticate, productController.downloadProductsExcel);

// Route to search products by name (requires authentication)
router.get("/search/abc/", authenticate, productController.Name);

module.exports = router;
