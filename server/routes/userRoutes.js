const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Ensure this path matches your folder structure
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. AUTH MIDDLEWARE: Verifies the digital ID (token) sent from the frontend
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token using your secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// 2. GET USER DATA ROUTE: This is what fixes the "refresh" logout issue
// http://localhost:5000/api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET FAVORITES
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE SERIES FAVORITE
router.post('/favorites/series', auth, async (req, res) => {
  try {
    const { seriesId } = req.body;
    const user = await User.findById(req.user.id);
    const exists = user.favorites.seriesIds.includes(seriesId);
    await User.findByIdAndUpdate(req.user.id,
      exists
        ? { $pull:     { 'favorites.seriesIds': seriesId } }
        : { $addToSet: { 'favorites.seriesIds': seriesId } }
    );
    const updated = await User.findById(req.user.id).select('favorites');
    res.json(updated.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE AUDIOBOOK FAVORITE
router.post('/favorites/books', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    const user = await User.findById(req.user.id);
    const exists = user.favorites.bookIds.includes(bookId);
    await User.findByIdAndUpdate(req.user.id,
      exists
        ? { $pull:     { 'favorites.bookIds': bookId } }
        : { $addToSet: { 'favorites.bookIds': bookId } }
    );
    const updated = await User.findById(req.user.id).select('favorites');
    res.json(updated.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE VIDEO EPISODE BOOKMARK
router.post('/favorites/episodes/video', auth, async (req, res) => {
  try {
    const { seriesId, episodeId } = req.body;
    const user = await User.findById(req.user.id);
    const exists = user.favorites.videoEpisodes.some(
      e => e.seriesId === seriesId && e.episodeId === Number(episodeId)
    );
    await User.findByIdAndUpdate(req.user.id,
      exists
        ? { $pull:     { 'favorites.videoEpisodes': { seriesId, episodeId: Number(episodeId) } } }
        : { $addToSet: { 'favorites.videoEpisodes': { seriesId, episodeId: Number(episodeId) } } }
    );
    const updated = await User.findById(req.user.id).select('favorites');
    res.json(updated.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE AUDIO EPISODE BOOKMARK
router.post('/favorites/episodes/audio', auth, async (req, res) => {
  try {
    const { bookId, episodeId } = req.body;
    const user = await User.findById(req.user.id);
    const exists = user.favorites.audioEpisodes.some(
      e => e.bookId === bookId && e.episodeId === Number(episodeId)
    );
    await User.findByIdAndUpdate(req.user.id,
      exists
        ? { $pull:     { 'favorites.audioEpisodes': { bookId, episodeId: Number(episodeId) } } }
        : { $addToSet: { 'favorites.audioEpisodes': { bookId, episodeId: Number(episodeId) } } }
    );
    const updated = await User.findById(req.user.id).select('favorites');
    res.json(updated.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;