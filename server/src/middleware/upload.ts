import multer from "multer";
import { Request } from "express";

// Configure temporary file storage in server RAM memory
const storage = multer.memoryStorage();

// Restrict uploads strictly to images to protect backend file system integrity
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image uploads are supported."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Caps file size at 5MB per upload
  },
});
