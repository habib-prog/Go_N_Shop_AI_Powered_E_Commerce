const { schemaCategory } = require("../helpers/ZodValidators/validator");
const {
  getCategories,
  createCategory,
} = require("../services/categoryService");

// Custom Error
const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Internal server Error" : error.message || "Error";

  return res.status(statusCode).json({ error: message });
};

// List Categories
const ListCategories = async (req, res) => {
  try {
    const categories = await getCategories();

    return res.status(200).json({
      message: "Category list fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Fetching categories failed:", error);
    return handleError(res, error);
  }
};

// Create Category
const CreateCategory = async (req, res) => {
  const parsed = schemaCategory.safeParse(req.body);

  try {
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation Failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { name , slug , parentId } = parsed.data;
    const newCategory = await createCategory({
      name,
      slug,
      parentId: parentId || null,
      file: req.file,
    });

    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Creating category failed:", error);
    return handleError(res, error);
  }
};

module.exports = {
  ListCategories,
  CreateCategory,
};
