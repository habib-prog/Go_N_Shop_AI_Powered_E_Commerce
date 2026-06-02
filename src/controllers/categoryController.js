const Category = require("../models/CategorySchema");
const { schemaCategory } = require("../helpers/ZodValidators/validator");
const uploadCategoryImageToCloudinary = require("../helpers/Cloudinary/uploadCategoryImageToCloudinary");

const CreateCategory = async (req, res) => {
  const parsed = schemaCategory.safeParse(req.body);

  try {
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation Failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { name } = parsed.data;

    if (!req.file) {
      return res.status(400).json({
        error: "Thumbnail image is required",
      });
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(409).json({
        error: "Category already exists",
      });
    }
    const uploadedImage = await uploadCategoryImageToCloudinary(req.file);

    const newCategory = await Category.create({
      name,
      thumbnail: uploadedImage.secure_url,
    });

    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Creating category failed:", error);
    return res.status(500).json({
      error: "Internal server Error",
    });
  }
};

module.exports = {
  CreateCategory,
};
