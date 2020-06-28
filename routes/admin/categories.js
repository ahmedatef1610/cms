const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const { userAuthenticated } = require("../../helpers/authentication");
/********************************************************/
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});
/********************************************************/
router.get("/", (req, res, next) => {
  Category.find({})
    .then((categories) => {
      res.render("admin/categories/index", { categories });
    })
    .catch((err) => {
      next(err);
    });
});
//////////////////////////
router.post("/create", (req, res, next) => {
  const newCategory = new Category({
    name: req.body.name,
  });

  newCategory
    .save()
    .then((savedCategory) => {
      res.redirect("/admin/categories");
    })
    .catch((err) => {
      next(err);
    });
});
//////////////////////////
router.get("/edit/:id", (req, res, next) => {
  Category.findOne({ _id: req.params.id })
    .then((category) => {
      res.render("admin/categories/edit", { category });
    })
    .catch((err) => {
      next(err);
    });
});

router.put("/edit/:id", (req, res, next) => {
  Category.findOne({ _id: req.params.id })
    .then((category) => {
      category.name = req.body.name;
      return category.save();
    })
    .then((savedCategory) => {
      res.redirect("/admin/categories");
    })
    .catch((err) => {
      next(err);
    });
});
//////////////////////////
router.delete("/:id", (req, res, next) => {
  Category.deleteOne({ _id: req.params.id })
    .then((result) => {
      res.redirect("/admin/categories");
    })
    .catch((err) => {
      next(err);
    });
});
/********************************************************/
module.exports = router;
