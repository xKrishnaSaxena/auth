import express from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import parser from "../config/multer.js";
dotenv.config();

const router = express.Router();

router.post("/posts", parser.single("photo"), async (req, res) => {
  try {
    let postImage = undefined;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      postImage = result.secure_url;
    }
    const newPost = await Post.create({
      title: req.body.title,
      content: req.body.content,
      user: req.body.user,
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

router.patch("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) {
      return res.status(404).send();
    }
    res.status(200).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).send();
    }
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send();
    }
    post.likes += 1;
    await post.save();
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/:id/comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send();
    }
    const comment = new Comment(req.body);
    await comment.save();
    post.comments.push(comment);
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

export default router;
