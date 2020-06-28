const express = require("express");
const router = express.Router();

const Post = require("../../models/Post");
const Category = require("../../models/Category");
const User = require("../../models/User");

const bcrypt = require("bcryptjs");
const passport = require("passport");
/********************************************************/
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "home";
  next();
});
/********************************************************/
// "/?page=1"
router.get("/", (req, res, next) => {
  const perPage = 5;
  const page = req.query.page || 1;

  let posts = [];
  let countPost;
  
  Post.find()
    .skip(perPage * page - perPage)
    .limit(perPage)
    .then((postss) => {
      posts = postss;
      return Post.countDocuments();
    })
    .then((postCount) => {
      countPost = postCount;
      return Category.find();
    })
    .then((categories) => {
      res.render("home/index", {
        posts,
        categories,
        current: parseInt(page),
        pages: Math.ceil(countPost / perPage),
      });
    })
    .catch((err) => {
      next(err);
    });
});
///////////////
router.get("/about", (req, res) => {
  res.render("home/about");
});
///////////////
router.get("/login", (req, res) => {
  res.render("home/login");
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
    failureFlash: true, //req.flash("error")
  })(req, res, next);
});
///////////////
router.get("/register", (req, res) => {
  res.render("home/register");
});
router.post("/register", (req, res) => {
  let errors = [];
  if (!req.body.firstName) {
    errors.push({ message: "please enter your first name" });
  }
  if (!req.body.lastName) {
    errors.push({ message: "please add a last name" });
  }
  if (!req.body.email) {
    errors.push({ message: "please add an email" });
  }
  if (!req.body.password) {
    errors.push({ message: "please enter a password" });
  }
  if (!req.body.passwordConfirm) {
    errors.push({ message: "This field cannot be blank" });
  }
  if (req.body.password !== req.body.passwordConfirm) {
    errors.push({ message: "Password fields don't match" });
  }
  if (errors.length > 0) {
    res.render("home/register", {
      errors: errors,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
  } else {
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        const newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: req.body.password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            newUser.save().then((savedUser) => {
              req.flash(
                "success_message",
                "You are now registered, please login"
              );
              res.redirect("/login");
            });
          });
        });
      } else {
        req.flash("error_message", "That email exist please login");
        res.redirect("/login");
      }
    });
  }
});
///////////////
router.get("/logout", (req, res, next) => {
  req.logOut();
  res.redirect("/login");
});
///////////////
// router.get("/post/:id", (req, res, next) => {
//   Post.findOne({ _id: req.params.id })
//     .populate({ path: "comments",match:{approveComment:true}, populate: { path: "user", model: "users" } })
//     .populate("user")
//     .then((post) => {
//       Category.find().then((categories) => {
//         res.render("home/post", { post, categories });
//       });
//     })
//     .catch((err) => {
//       next(err);
//     });
// });
router.get("/post/:slug", (req, res, next) => {
  Post.findOne({ slug: req.params.slug })
    .populate({
      path: "comments",
      match: { approveComment: true },
      populate: { path: "user", model: "users" },
    })
    .populate("user")
    .then((post) => {
      Category.find().then((categories) => {
        res.render("home/post", { post, categories });
      });
    })
    .catch((err) => {
      next(err);
    });
});
/********************************************************/
module.exports = router;
