const express = require('express');
const {
  ListCategories,
  CreateCategory,
} = require('../controllers/categoryController');
const verifyAccessToken = require('../middleware/verifyAccessToken');
const isAdmin = require('../middleware/isAdmin');
const uploadCategoryImage = require('../middleware/uploadCategoryImage');

const router = express.Router();

router.get('/', ListCategories);
// Create Category ROUTES
router.post(
  '/createcategory',
  verifyAccessToken,
  isAdmin,
  uploadCategoryImage.single('thumbnail'),
  CreateCategory
);
module.exports = router;
