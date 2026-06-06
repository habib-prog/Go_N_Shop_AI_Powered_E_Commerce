const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        trim:true,
    },
    slug: {
        type: String,
        required: true,
        trim:true,
        unique:true,
        lowercase:true,
    },
    description: {
        type: String,
        required: true,
        trim:true,
    },
    brand:{
        type: String,
        required: true,
        trim: true,
    },
    // Category and Sub-Category Relations

    // The id will be coming from the Category model eg. Laptop, Mobile etc..
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required: true,
    },
    // The id will be coming from the SubCategory model eg. Apple, Samsung, Xiaomi, Huawei etc..
    subCategory:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Category",
        default: null,
    },
    // Global branding sku for the product eg. iphone17pro 256gb
    sku:{
        type: String,
        required:true,
        trim:true,
        unique:true,
    },
    price:{
        type: Number,
        required: true,
    },
    discountedPrice:{
        type: Number,
        default: 0
    },
    // Main product images (required to be 5)
    images:[
        {
            type: String,
            required: true,
        }
    ],
    // Thumbnail image (required to be 1)
    thumbnailImage:{
        type: String,
        required: true,
    },
    // Product Specifications (key-value pairs for dynamic attributes) 
    // eg: {"key": "Color", "value": "Black"} or {"key": "Storage", "value": "256GB"} or {"key": "RAM", "value": "8GB"}
    Specifications:[
       {
        key:{
            type: String,
            required: true,
            trim: true,
        },
        value:{
            type: String,
            required: true,
            trim: true,
        },
       }
    ],
    variants: [{
    color: { type: String },       // e.g., 'Space Gray'
    ram: { type: String },         // e.g., '16GB'
    storage: { type: String },     // e.g., '512GB'
    variantSku: { type: String },  // SKU: e.g., 'APL-MBP14-SG-16-512'
    variantPrice: { type: Number },// this ram/storage different price if not set then main price will be used
    variantStock: { type: Number, default: 0 } // this ram/storage different stock if not set then main stock will be used
  }],
  status: {
    type: String,
    enum: ['in-stock', 'pre-order', 'out-of-stock'],
    default: 'in-stock'
  }
},{timestamps:true});

// text search index for search functionality
ProductSchema.index({title:"text",description:"text",brand:"text"})

module.exports = mongoose.model("Product",ProductSchema);
 