import express from "express";
import connectDB from "./config/db.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
connectDB();
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
