const express = require("express");
const router = express.Router();

const Post = require("../../models/Post");
const Category = require("../../models/Category");

const {
  uploadDir,
  isEmpty,
  deleteFile,
} = require("../../helpers/upload-helper");
const fs = require("fs");
const path = require("path");
const { userAuthenticated } = require("../../helpers/authentication");
/********************************************************/
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});
/********************************************************/
router.get("/", (req, res, next) => {
  Post.find({})
    .populate("category")
    .then((posts) => {
      res.render("admin/posts", { posts });
    })
    .catch((err) => {
      next(err);
    });
});
router.get("/my-posts", (req, res) => {
  Post.find({ user: req.user.id })
    .populate("category")
    .then((posts) => {
      res.render("admin/posts/my-posts", { posts });
    });
});

//////////////////////////
router.get("/create", (req, res) => {
  Category.find({}).then((categories) => {
    res.render("admin/posts/create", { categories: categories });
  });
});
router.post("/create", (req, res, next) => {
  let errors = [];
  if (!req.body.title) {
    errors.push({ message: "please add a title" });
  }
  if (!req.body.status) {
    errors.push({ message: "please add a status" });
  }
  if (!req.body.body) {
    errors.push({ message: "please add a Description" });
  }
  /******/
  if (errors.length > 0) {
    res.render("admin/posts/create", { errors });
  } else {
    let fileName;
    if (!isEmpty(req.files)) {
      let file = req.files.file;
      fileName = Date.now() + "-" + file.name;
      let dirUploads = "./public/uploads/";
      // Make sure the image is a photo
      if (!file.mimetype.startsWith("image")) {
        return next(new Error(`Please upload an image file`));
      }
      // Check filesize
      if (file.size > 1000000) {
        return next(new Error(`Please upload an image less than 1MB`));
      }
      file.mv(dirUploads + fileName, (err) => {
        if (err) {
          return next(err);
        }
      });
    }

    let newPost = new Post({
      user: req.user.id,
      title: req.body.title,
      status: req.body.status,
      allowComments: req.body.allowComments ? true : false, // on or undefined
      body: req.body.body,
      file: fileName,
      category: req.body.category,
    });

    newPost
      .save()
      .then((savedPost) => {
        req.flash(
          "success_message",
          `Post ${savedPost.title} was created successfully`
        );
        res.redirect("/admin/posts/");
      })
      .catch((err) => {
        res.render("admin/posts/create", { errors: err.errors });
        // next(err);
      });
  }
});

//////////////////////////
router.get("/edit/:id", (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      Category.find({}).then((categories) => {
        res.render("admin/posts/edit", { post: post, categories: categories });
      });
    })
    .catch((err) => {
      next(err);
    });
});

router.put("/edit/:id", (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      post.user = req.user.id;
      post.title = req.body.title;
      post.status = req.body.status;
      post.allowComments = req.body.allowComments ? true : false; // on or undefined
      post.body = req.body.body;
      post.category = req.body.category;

      let fileName;
      let file = req.files ? req.files.file : false;
      if (file) {
        deleteFile(uploadDir + post.file);
        if (!isEmpty(req.files)) {
          fileName = Date.now() + "-" + file.name;
          let dirUploads = "./public/uploads/";
          // Make sure the image is a photo
          if (!file.mimetype.startsWith("image")) {
            return next(new Error(`Please upload an image file`));
          }
          // Check filesize
          if (file.size > 1000000) {
            return next(new Error(`Please upload an image less than 1MB`));
          }
          file.mv(dirUploads + fileName, (err) => {
            if (err) {
              return next(err);
            }
          });
        }
        post.file = fileName;
      }

      return post.save();
    })
    .then((updatedPost) => {
      req.flash(
        "success_message",
        `Post ${updatedPost.title} was updated successfully`
      );
      res.redirect("/admin/posts");
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});
//////////////////////////
router.delete("/:id", (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .populate("comments")
    .then((post) => {
      fs.unlink(uploadDir + post.file, (err) => {
        if (err) {
          //return next(err);
        }
        if (!post.comments.length < 1) {
          post.comments.forEach((comment) => {
            comment.remove();
          });
        }
        return post.remove();
      });
    })
    .then(() => {
      req.flash("success_message", `Post was deleted successfully`);
      res.redirect("/admin/posts/my-posts");
    })
    .catch((err) => {
      next(err);
    });
});
/********************************************************/
module.exports = router;
