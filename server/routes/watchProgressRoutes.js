const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const WatchProgress = require('../models/WatchProgress');

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

// GET all progress entries for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await WatchProgress.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPSERT a progress entry (create or update by userId + seriesId + episodeId)
router.post('/', auth, async (req, res) => {
  try {
    const { seriesId, episodeId, timestamp, duration } = req.body;
    const entry = await WatchProgress.findOneAndUpdate(
      { userId: req.user.id, seriesId, episodeId: Number(episodeId) },
      { timestamp, duration, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a single progress entry
router.delete('/:seriesId/:episodeId', auth, async (req, res) => {
  try {
    await WatchProgress.deleteOne({
      userId: req.user.id,
      seriesId: req.params.seriesId,
      episodeId: Number(req.params.episodeId),
    });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
