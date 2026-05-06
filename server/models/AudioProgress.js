const mongoose = require('mongoose');
const { Schema } = mongoose;

const AudioProgressSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookId:    { type: String, required: true },
  episodeId: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  duration:  { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

AudioProgressSchema.index({ userId: 1, updatedAt: -1 });
AudioProgressSchema.index({ userId: 1, bookId: 1, episodeId: 1 }, { unique: true });

module.exports = mongoose.model('AudioProgress', AudioProgressSchema);
