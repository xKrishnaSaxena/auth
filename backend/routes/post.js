import express from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import parser from "../config/multer.js";
import { protect } from "./auth.js";
dotenv.config();

const router = express.Router();

router.post("/new", protect, parser.single("photo"), async (req, res) => {
  try {
    let postImage = undefined;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      postImage = result.secure_url;
    }
    const newPost = await Post.create({
      title: req.body.title,
      content: req.body.content,
      user: req.user._id,
      photo: postImage,
    });
    res.status(201).send(newPost);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("user comments");
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user comments");
    if (!post) {
      return res.status(404).send();
    }
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .send({ message: "You are not allowed to update this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send(updatedPost);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .send({ message: "You are not allowed to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).send({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send();
    }
    if (post.likes.includes(req.user._id)) {
      return res
        .status(400)
        .send({ message: "You have already liked this post" });
    }

    post.likes.push(req.user._id);
    await post.save();
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/:id/comment", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send();
    }
    const comment = new Comment({
      ...req.body,
      user: req.user._id,
    });
    await comment.save();
    post.comments.push(comment);
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

export default router;
