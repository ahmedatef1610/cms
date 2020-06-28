const mongoose = require("mongoose");
/******************************************************/
const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
  },
  body: {
    type: String,
    required: true,
  },
  approveComment: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
/******************************************************/
module.exports = mongoose.model("comments", CommentSchema);
