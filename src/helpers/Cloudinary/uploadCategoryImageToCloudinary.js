// 01- Importing the cloudinary config from folder

const cloudinary = require("../../config/cloudinary");

// 02 - Converting Image base64 to string

const uploadCategoryImageToCloudinary = async (file) => {
  const base64File = file.buffer.toString("base64");
  const fileUri = `data:${file.mimetype};base64,${base64File}`;
  return cloudinary.uploader.upload(fileUri, {
    folder: "go_n_shop/categories",
    resource_type: "image",
  });
};

module.exports = uploadCategoryImageToCloudinary;
