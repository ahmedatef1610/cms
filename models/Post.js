const mongoose = require("mongoose");
const URLSlugs = require("mongoose-url-slugs");
/******************************************************/
const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "public",
      require: true,
    },
    allowComments: {
      type: Boolean,
      require: true,
    },
    body: {
      type: String,
      require: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    file: {
      type: String,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "categories",
    },
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "comments",
      },
    ],
    slug: {
      type: String,
    },
  },
  { usePushEach: true }
);
/**************/
PostSchema.plugin(URLSlugs("title", { field: "slug" }));
/*****************************************************************************/
module.exports = mongoose.model("posts", PostSchema);
