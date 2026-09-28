const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// ✅ CLOUDINARY UPLOAD ROUTE
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "jobportal",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res
            .status(500)
            .json({ message: "Cloudinary upload failed", error });
        }

        return res.status(200).json({
          imageUrl: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("Upload handler error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

module.exports = router;
