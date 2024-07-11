import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGO_URL;
    if (!mongoURL) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }
    await mongoose.connect(mongoURL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
