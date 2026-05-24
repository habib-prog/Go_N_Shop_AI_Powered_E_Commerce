const Category = require("../models/CategorySchema");
const { schemaCategory } = require("../helpers/ZodValidators/validator");

const CreateCategory = async (req, res) => {
  const parsed = schemaCategory.safeParse(req.body);

  try {
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation Failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, thumbnail } = parsed.data;

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(409).json({
        error: "Category already exists",
      });
    }

    const newCategory = await Category.create({
      name,
      thumbnail,
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
