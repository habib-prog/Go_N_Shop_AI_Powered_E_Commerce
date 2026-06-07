const express = require("express");
const { addProduct, getProducts } = require("../controllers/productController");
const verifyAccessToken = require("../middleware/verifyAccessToken");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// Route to get all products (Public route with pagination/search/category filters support)
router.get("/", getProducts);
router.get("/all", getProducts);

// Route to add a new product (Admin only)
router.post("/addproduct", verifyAccessToken, isAdmin, addProduct);
router.post("/add-product", verifyAccessToken, isAdmin, addProduct);

module.exports = router;
