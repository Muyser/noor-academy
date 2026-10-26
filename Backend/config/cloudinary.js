import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

export const connectCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Verify connection parameters via Cloudinary API ping
    await cloudinary.api.ping();
    console.log("✅ Cloudinary storage engine connected successfully!");
  } catch (error) {
    console.error(
      "❌ Cloudinary connection failed! Check your .env credentials.",
    );
    console.error(error.message);
  }
};

const storage = multer.memoryStorage();

// Configure Multer memory storage allocation for your multi-part routes
const fileFilter = (req, file, cb) => {
  // Allow images, PDFs, and videos (for business registration documents)
  if (
    file.mimetype.startsWith("image/") || 
    file.mimetype === "application/pdf" || 
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image, PDF, and video files are supported!"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit
});

export default cloudinary;
