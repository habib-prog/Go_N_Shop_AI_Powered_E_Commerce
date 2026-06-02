// 01- Importing the library for uploading image (Multer)
const multer = require("multer");

// 02- Declearing where the file will be stored after uploading (Ram)
const storage = multer.memoryStorage();

// 03- Checking the file type

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startWith("image/")) {
    return cb(null, true);
  }
  return cb(new Error("Only image files are allowed"));
};

// 04- Main Upload Func()

const uploadCategoryImage = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = uploadCategoryImage;
