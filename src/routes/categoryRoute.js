const express = require("express");
const Category = require("../models/CategorySchema");
const { CreateCategory } = require("../controllers/categoryController");
const verifyAccessToken = require("../middleware/verifyAccessToken");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    return res.status(200).json({
      message: "Category list fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Fetching categories failed:", error);
    return res.status(500).json({ error: "Internal server Error" });
  }
});
// Create Category ROUTES
router.post("/createcategory", verifyAccessToken, isAdmin, CreateCategory);
module.exports = router;
