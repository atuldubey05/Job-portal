const multer = require("multer");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, res, cb) => {
    cb(null, `${Date.now()}-${File.originalname}`);
  },
});

// File filter
const fileFilter = (req, res, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  if (allowedTypes.includes(fileFilter.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Only .jpeg, .jpg, .png, and .pdf formats are allowed`),
      false,
    );
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
