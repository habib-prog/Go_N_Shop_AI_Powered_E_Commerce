const User = require('../../models/userSchema');
const createHttpError = require('./httpError');
const destroyAvatarFromCloudinary = require('../../helpers/Cloudinary/destroyAvatarFromCloudinary');
const uploadAvatarToCloudinary = require('../../helpers/Cloudinary/uploadAvatarToCloudinary');

// Profile flow: read/update the logged-in user's profile.
const getProfile = async (userId) => {
  const user = await User.findById(userId).select(
    'fullname email avatar address role isBanned createdAt updatedAt'
  );

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
};

const updateProfile = async ({ userId, fullname, file }) => {
  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw createHttpError(404, 'User not found');
  }

  const updateData = {};

  if (fullname && fullname.trim()) {
    updateData.fullname = fullname.trim();
  }

  if (file) {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw createHttpError(500, 'Cloudinary is not configured');
    }

    const uploadedAvatar = await uploadAvatarToCloudinary(file);
    updateData.avatar = uploadedAvatar.secure_url;
    updateData.avatarPublicId = uploadedAvatar.public_id;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('fullname email avatar address role isBanned createdAt updatedAt');

  if (file && existingUser.avatarPublicId) {
    await destroyAvatarFromCloudinary(existingUser.avatarPublicId);
  }

  return user;
};

const getUserVerificationStatus = async ({ isVerified, page, limit }) => {
  const filter = {};

  if (typeof isVerified === 'boolean') {
    filter.isVerified = isVerified;
  }

  const totalUsers = await User.countDocuments(filter);
  const skip = (page - 1) * limit;
  const users = await User.find(filter)
    .select('fullname email avatar address role isVerified isBanned createdAt')
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalUsers / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  if (typeof isVerified === 'boolean') {
    return {
      message: 'User verification status fetched successfully',
      appliedFilter: { isVerified },
      count: users.length,
      users,
    };
  }

  const response = {
    message: 'User verification status fetched successfully',
    appliedFilter: 'all users',
    pagination: {
      totalUsers,
      totalPages,
      currentPage: page,
      limit,
      hasPrevPage,
      hasNextPage,
    },
    users,
  };

  if (hasNextPage) {
    response.pagination.nextPage = page + 1;
  }

  if (hasPrevPage) {
    response.pagination.prevPage = page - 1;
  }

  return response;
};

module.exports = {
  getProfile,
  updateProfile,
  getUserVerificationStatus,
};
