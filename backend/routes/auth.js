import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import dotenv from "dotenv";
import { sendResetEmail } from "../config/nodemailer.js";
dotenv.config();

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};
export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ status: "fail", message: "You are not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: "fail", message: "User not logged in" });
  }
};

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    createSendToken(user, 201, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    createSendToken(user, 201, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
router.get("/logout", (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "User Logged out Successfully" });
});

router.post("/forget-password", async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        sendResetEmail(email, token);
        res.json({ msg: "Password reset token sent to email" });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.json({ msg: "Password has been reset successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
