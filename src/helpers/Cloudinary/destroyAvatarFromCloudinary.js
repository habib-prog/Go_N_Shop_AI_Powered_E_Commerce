const cloudinary = require('../../config/cloudinary');

const destroyAvatarFromCloudinary = async (publicId) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
  });
};

module.exports = destroyAvatarFromCloudinary;
