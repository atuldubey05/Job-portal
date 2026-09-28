const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// @desc Update user profile (name, avatar, company details)
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      avatar,
      companyName,
      companyDescription,
      companyLogo,
      resume,
    } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.resume = resume || user.resume;

    // If employer, allow updating company info
    if (user.role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
      user.companyLogo = companyLogo || user.companyLogo;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @desc Delete resume file  (Jobseeker only)
exports.deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseeker can delete resume" });
    }
    // Agar resume Cloudinary ka hai, to uski public_id nikal kar destroy kar sakte hain
    if (resumeUrl && resumeUrl.includes("cloudinary.com")) {
      try {
        // e.g. https://res.cloudinary.com/.../jobportal/filename.pdf
        const parts = resumeUrl.split("/");
        const fileNameWithExt = parts.pop();
        const folder = parts.pop();
        const publicId = `${folder}/${fileNameWithExt.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      } catch (cloudErr) {
        console.error("Failed to delete from Cloudinary:", cloudErr);
      }
    }
    // Database me empty string set karein
    user.resume = "";
    await user.save();
    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc Get user public profile
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
