process.env.NODE_ENV = "production";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
var flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
// const dbUrl = process.env.DB_URL;

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelpCamp";

const MongoStore = require("connect-mongo");

const helmet = require("helmet");
app.use(helmet({ contentSecurityPolicy: false }));
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/bootstrap/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/npm/",
];
const styleSrcUrls = [
  "https://fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/bootstrap/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = ["https://fonts.gstatic.com/s/opensans/v13/"];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dwtytn7fl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

var cookieParser = require("cookie-parser");
app.use(cookieParser("thisismysecret"));

const campgroundRoute = require("./Routes/campgrounds");
const reiviewRoute = require("./Routes/reviews");
const userRoute = require("./Routes/users");

main().catch((err) => console.log(err));
async function main() {
  // mongodb://127.0.0.1:27017/yelpCamp
  mongodb: await mongoose.connect(dbUrl);
  console.log("Mongo Connection Open!!!");
}

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const secret = process.env.SECRET || "thisisnotagoodsecret";

const store = new MongoStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookies: {
    httpOnly: true,
    // secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
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
  res.locals.currentUser = req.user;
  next();
});

app.use("/", userRoute);
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/reviews", reiviewRoute);

// app.use(express.static("public"));   <!--adding public directory -->

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("PAGE NOT FOUND", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong !!";
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error", { err });
  // res.send("OH boy we got an error");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("App Is Listening On Port 3000!");
});
