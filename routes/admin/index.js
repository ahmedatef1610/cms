const express = require("express");
const router = express.Router();

const Post = require("../../models/Post");
const Category = require("../../models/Category");
const Comment = require("../../models/Comment");
const { userAuthenticated } = require("../../helpers/authentication");
/********************************************************/
const faker = require("faker");
/********************************************************/
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});
/********************************************************/
router.get("/", (req, res) => {
  const promises = [
    Post.countDocuments().exec(),
    Category.countDocuments().exec(),
    Comment.countDocuments().exec(),
  ];

  Promise.all(promises).then(([postCount, categoryCount, commentCount]) => {
    res.render("admin/index", { postCount, categoryCount, commentCount });
  });
});
router.get("/dashboard", (req, res) => {
  res.render("admin/dashboard");
});
//////////////////////////////////////
router.post("/generate-fake-posts", (req, res, next) => {
  for (let i = 0; i < req.body.amount; i++) {
    let post = new Post();
    post.title = faker.name.title();
    post.status = "public";
    post.allowComments = faker.random.boolean();
    post.body = faker.lorem.sentence();
    post.user = req.user.id;

    post.save();
  }
  res.redirect("/admin/posts");
});
/********************************************************/
module.exports = router;
