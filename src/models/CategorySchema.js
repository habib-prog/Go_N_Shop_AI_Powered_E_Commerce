const mongoose = require('mongoose');

/**
 * Category Schema
 * Represents a product category in the system, supporting nested/hierarchical categories.
 */
const categorySchema = new mongoose.Schema(
  {
    // The display name of the category (must be unique, required, and trimmed of whitespace)
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // URL-friendly version of the category name (e.g., "electronics-appliances" for "Electronics & Appliances")
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // The image path or URL representing the category
    image: {
      type: String,
      required: true,
    },
    // Self-referencing field to build a hierarchical category tree
    // Points to the parent Category document; null indicates it is a top-level category
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  // Automatically manage createdAt and updatedAt timestamps for each category document
  { timestamps: true }
);

// Export the Category model for use in other parts of the application
module.exports = mongoose.model('Category', categorySchema);
