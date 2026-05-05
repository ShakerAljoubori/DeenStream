const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Comment = require('../models/Comment');
const User = require('../models/user');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// GET comments for an episode
router.get('/:seriesId/:episodeId', async (req, res) => {
  try {
    const comments = await Comment
      .find({ seriesId: req.params.seriesId, episodeId: Number(req.params.episodeId) })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a comment
router.post('/', auth, async (req, res) => {
  try {
    const { seriesId, episodeId, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ msg: 'Comment text required' });

    const user = await User.findById(req.user.id).select('name');
    const comment = new Comment({
      seriesId,
      episodeId: Number(episodeId),
      userId: req.user.id,
      userName: user.name,
      text: text.trim().slice(0, 1000),
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EDIT own comment
router.put('/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ msg: 'Text required' });
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: 'Not found' });
    if (comment.userId.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
    comment.text = text.trim().slice(0, 1000);
    comment.editedAt = new Date();
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE like on a comment
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: 'Not found' });
    const uid = req.user.id;
    const likedIdx    = comment.likes.findIndex(id => id.toString() === uid);
    const dislikedIdx = comment.dislikes.findIndex(id => id.toString() === uid);
    if (likedIdx > -1) {
      comment.likes.splice(likedIdx, 1);
    } else {
      if (dislikedIdx > -1) comment.dislikes.splice(dislikedIdx, 1);
      comment.likes.push(uid);
    }
    await comment.save();
    res.json({ likes: comment.likes, dislikes: comment.dislikes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE dislike on a comment
router.post('/:id/dislike', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: 'Not found' });
    const uid = req.user.id;
    const dislikedIdx = comment.dislikes.findIndex(id => id.toString() === uid);
    const likedIdx    = comment.likes.findIndex(id => id.toString() === uid);
    if (dislikedIdx > -1) {
      comment.dislikes.splice(dislikedIdx, 1);
    } else {
      if (likedIdx > -1) comment.likes.splice(likedIdx, 1);
      comment.dislikes.push(uid);
    }
    await comment.save();
    res.json({ likes: comment.likes, dislikes: comment.dislikes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE own comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.userId.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
    await comment.deleteOne();
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
