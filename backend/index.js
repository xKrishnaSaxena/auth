import express from "express";
import connectDB from "./config/db.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config(); // Ensure this is at the top

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
