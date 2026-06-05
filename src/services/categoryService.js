const Category = require("../models/CategorySchema");
const uploadCategoryImageToCloudinary = require("../helpers/Cloudinary/uploadCategoryImageToCloudinary");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getCategories = async () => {
  const categories = await Category.find().sort({ name: 1 });

  return categories;
};

const createCategory = async ({ name, file }) => {
  if (!file) {
    throw createHttpError(400, "Thumbnail image is required");
  }

  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    throw createHttpError(409, "Category already exists");
  }

  const uploadedImage = await uploadCategoryImageToCloudinary(file);

  return Category.create({
    name,
    thumbnail: uploadedImage.secure_url,
  });
};

module.exports = {
  getCategories,
  createCategory,
};
