const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

const mongoose = require("mongoose");
const { mongoDbUrl } = require("./config/database");

const methodOverride = require("method-override");
const {
  select,
  generateDate,
  paginate,
} = require("./helpers/handlebars-helpers");

const fileUpload = require("express-fileupload");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
require("./config/passport")(passport);
/********************************************************/
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(fileUpload());
app.engine(
  "hbs",
  exphbs({
    defaultLayout: "home",
    layoutsDir: "views/layouts",
    extname: ".hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: { select, generateDate, paginate },
  })
);
app.set("view engine", "hbs");

/**************************************/
// app.use((req, res, next) => {
//   res.status(503).send("Site is currently down. Check back soon!");
// });
/**************************************/
app.use(
  session({
    secret: "ahmed16101998",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
/**************************************/
app.use((req, res, next) => {
  res.locals.date = new Date().getFullYear();
  res.locals.success_message = req.flash("success_message");
  res.locals.error_message = req.flash("error_message");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});
/**************************************/
const home = require("./routes/home/index");
const admin = require("./routes/admin/index");
const posts = require("./routes/admin/posts");
const categories = require("./routes/admin/categories");
const comments = require("./routes/admin/comments");

app.use("/", home);
app.use("/admin", admin);
app.use("/admin/posts", posts);
app.use("/admin/categories", categories);
app.use("/admin/comments", comments);

app.use((error, req, res, next) => {
  res.status(500).send({ error: error.message });
});
/********************************************************/
const port = process.env.PORT || 8080;
mongoose
  .connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((db) => {
    console.log("mongoDB Connected....");
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
