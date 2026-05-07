const mongoose = require('mongoose');

const VideoReactionSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  seriesId:  { type: String, required: true },
  episodeId: { type: Number, required: true },
  reaction:  { type: String, enum: ['like', 'dislike'], required: true },
}, { timestamps: true });

VideoReactionSchema.index({ userId: 1, seriesId: 1, episodeId: 1 }, { unique: true });

module.exports = mongoose.model('VideoReaction', VideoReactionSchema);
