import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts",
    allowed_formats: ["jpg", "png"],
  },
});

const parser = multer({ storage: storage });

export default parser;
