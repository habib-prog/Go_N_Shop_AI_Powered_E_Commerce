const cloudinary = require("../../config/cloudinary");

const uploadAvatarToCloudinary = async (file) => {
  const base64File = file.buffer.toString("base64");
  const fileUri = `data:${file.mimetype};base64,${base64File}`;

  return cloudinary.uploader.upload(fileUri, {
    folder: "go_n_shop/avatars",
    resource_type: "image",
  });
};

module.exports = uploadAvatarToCloudinary;
