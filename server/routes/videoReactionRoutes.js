const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const VideoReaction = require('../models/VideoReaction');

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

// GET all episodes liked by the current user (for playlist)
router.get('/liked', auth, async (req, res) => {
  try {
    const reactions = await VideoReaction.find({ userId: req.user.id, reaction: 'like' })
      .sort({ createdAt: -1 });
    res.json(reactions.map(r => ({ seriesId: r.seriesId, episodeId: r.episodeId })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET counts + user reaction for an episode
router.get('/:seriesId/:episodeId', async (req, res) => {
  try {
    const { seriesId, episodeId } = req.params;
    const epId = Number(episodeId);

    const [likes, dislikes] = await Promise.all([
      VideoReaction.countDocuments({ seriesId, episodeId: epId, reaction: 'like' }),
      VideoReaction.countDocuments({ seriesId, episodeId: epId, reaction: 'dislike' }),
    ]);

    let userReaction = null;
    const token = req.header('x-auth-token');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const existing = await VideoReaction.findOne({ userId: decoded.id, seriesId, episodeId: epId });
        if (existing) userReaction = existing.reaction;
      } catch { /* invalid token */ }
    }

    res.json({ likes, dislikes, userReaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST toggle reaction
router.post('/', auth, async (req, res) => {
  try {
    const { seriesId, episodeId, reaction } = req.body;
    if (!['like', 'dislike'].includes(reaction)) return res.status(400).json({ msg: 'Invalid reaction' });

    const epId = Number(episodeId);
    const existing = await VideoReaction.findOne({ userId: req.user.id, seriesId, episodeId: epId });

    if (existing) {
      if (existing.reaction === reaction) {
        await existing.deleteOne();
      } else {
        existing.reaction = reaction;
        await existing.save();
      }
    } else {
      await VideoReaction.create({ userId: req.user.id, seriesId, episodeId: epId, reaction });
    }

    const [likes, dislikes] = await Promise.all([
      VideoReaction.countDocuments({ seriesId, episodeId: epId, reaction: 'like' }),
      VideoReaction.countDocuments({ seriesId, episodeId: epId, reaction: 'dislike' }),
    ]);
    const updated = await VideoReaction.findOne({ userId: req.user.id, seriesId, episodeId: epId });

    res.json({ likes, dislikes, userReaction: updated ? updated.reaction : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
