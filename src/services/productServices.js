const Product = require("../models/productSchema.js");

exports.createNewProduct = async (productData) => {
  // Basic validation
  const requiredFields = [
    "title",
    "description",
    "brand",
    "category",
    "sku",
    "price",
    "thumbnailImage",
  ];
  //checking all the require fields are filled
  for (const field of requiredFields) {
    if (
      productData[field] === undefined ||
      productData[field] === null ||
      (typeof productData[field] === "string" &&
        productData[field].trim() === "")
    ) {
      throw new Error(`Validation Error: '${field}' field is required.`);
    }
  }

  // Auto-generate slug from title if not provided
  if (productData.title && !productData.slug) {
    productData.slug = productData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // if space or special character make it dash
      .replace(/(^-|-$)+/g, ""); //if dash at the begining or at the end remove it
  }

  // image gallery validation (required 5 images)
  if (!productData.images || !Array.isArray(productData.images)) {
    throw new Error("Validation Error: Images must be an array.");
  }
  if (productData.images.length !== 5) {
    throw new Error(
      `Validation Error: Product gallery images count must be exactly 5. You provided ${productData.images.length}.`,
    );
  }

  //   Dynamic Specifications Validation
  if (productData.specifications && Array.isArray(productData.specifications)) {
    for (const spec of productData.specifications) {
      if (!spec.key || !spec.value) {
        throw new Error(
          "Validation Error: Each specification must have both key and value.",
        );
      }
    }
  }

  // variants validation
  if (productData.variants && Array.isArray(productData.variants)) {
    for (const variant of productData.variants) {
      //   variant price or stock cannot be negative
      if (variant.variantPrice && variant.variantPrice < 0) {
        throw new Error(
          `Validation Error: Variant price cannot be negative for color: ${variant.color || "unknown"}.`,
        );
      }
      if (variant.variantStock && variant.variantStock < 0) {
        throw new Error(
          `Validation Error: Variant stock cannot be negative for color: ${variant.color || "unknown"}.`,
        );
      }
    }
  }

  //duplicate checking
  const existingProduct = await Product.findOne({
    $or: [{ sku: productData.sku }, { slug: productData.slug }],
  });

  if (existingProduct) {
    if (existingProduct.sku === productData.sku) {
      throw new Error(
        `Duplicate Error: Product SKU '${productData.sku}' already exists.`,
      );
    }
    if (existingProduct.slug === productData.slug) {
      throw new Error(
        `Duplicate Error: Product Slug '${productData.slug}' already exists.`,
      );
    }
  }

  const newProduct = new Product(productData);
  return await newProduct.save();
};

exports.getAllProducts = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
