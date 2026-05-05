const mongoose = require('mongoose');
const { Schema } = mongoose;

const WatchProgressSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seriesId:  { type: String, required: true },
  episodeId: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  duration:  { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

WatchProgressSchema.index({ userId: 1, updatedAt: -1 });
WatchProgressSchema.index({ userId: 1, seriesId: 1, episodeId: 1 }, { unique: true });

module.exports = mongoose.model('WatchProgress', WatchProgressSchema);
