if (process.env.NODE_ENV !== "prod") {
  require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const campgrounds = require("./routes/campgrounds")
const reviews = require("./routes/reviews");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require('./models/user');
const auth = require("./routes/auth");

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.reviewDeleted = req.flash("reviewDeleted");
  res.locals.currentUser = req.user;
  next();
});

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

// //delete after (creating a fake user)
// app.get("/fakeUser", async (req, res) => {
//   const fakeUser = new User({ email: "xxx@gmail.com", username: "xxx" });
//   const newUser = await User.register(fakeUser, 'chicken');
//   res.send(newUser);
// })

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);
app.use("/", auth);

app.get("/", (req, res) => {
  res.redirect("/campgrounds");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "OOPS", stack } = err;
  if (res.locals.error && res.locals.error.length) {
    return res.redirect("/campgrounds");
  }
  res.status(statusCode).render("errors", { message, statusCode, stack });
});

app.listen(3000, () => {
  console.log("Seving on port 3000");
});
