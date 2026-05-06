const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  seriesId:  { type: String, required: true },
  episodeId: { type: Number, required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:  { type: String, required: true },
  text:      { type: String, required: true, maxlength: 1000 },
  likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  parentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  editedAt:  { type: Date },
  createdAt: { type: Date, default: Date.now },
});

CommentSchema.index({ seriesId: 1, episodeId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
