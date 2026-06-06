const Category = require("../models/CategorySchema");
const uploadCategoryImageToCloudinary = require("../helpers/Cloudinary/uploadCategoryImageToCloudinary");

// Custom Error
const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
// All categories
const getCategories = async () => {
  const categories = await Category.find().sort({ _id: 1, name: 1 });

  return categories;
};
// Create category
const createCategory = async ({ name, file, slug, parentId }) => {
  if (!file) {
    throw createHttpError(400, "Image is required");
  }
  if (!name) {
    throw createHttpError(400, "Name is required");
  }
  if (!slug) {
    throw createHttpError(400, "Slug is required");
  }

  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    throw createHttpError(409, "Category already exists");
  }

  const uploadedImage = await uploadCategoryImageToCloudinary(file);

  return Category.create({
    name,
    slug,
    image: uploadedImage.secure_url,
    parentId: parentId || null,
  });
};

module.exports = {
  getCategories,
  createCategory,
};
