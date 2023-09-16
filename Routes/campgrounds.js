const express = require("express");
const router = express.Router();
const CatchAsync = require("../utils/CatchAsync");
const { isLoggedIn, validateCampgrounds, isAuthor } = require("../middleware");
const campgrounds = require("../controllers/campgrounds.js");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

router
  .route("/")
  .get(CatchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampgrounds,
    CatchAsync(campgrounds.createCampground)
  );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(CatchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampgrounds,
    CatchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, CatchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  CatchAsync(campgrounds.renderEditForm)
);

module.exports = router;
