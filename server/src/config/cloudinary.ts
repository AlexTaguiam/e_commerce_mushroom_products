import { v2 as cloudinary } from "cloudinary";

// This will automatically read CLOUDINARY_URL from process.env
cloudinary.config({
  secure: true, // optional, forces https URLs
});

export default cloudinary;
