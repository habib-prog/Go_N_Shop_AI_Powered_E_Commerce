const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    avatar: {
      type: String,
    },

    avatarPublicId: {
      type: String,
      default: null,
    },

    address: {
      type: String,
    },

    otp: {
      type: String,
      default: null,
      select: false,
    },
    // Tracks whether the user's email has been verified
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Stores the OTP expiration time
    otpExp: {
      type: Date,
      select: false,
    },

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "moderator"],
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
