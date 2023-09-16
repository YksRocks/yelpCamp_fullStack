const express = require("express");
const router = express.Router({ mergeParams: true });
const CatchAsync = require("../utils/CatchAsync");
const reviews = require("../controllers/reviews");
const {
  validateReviews,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware");

router.post("/", isLoggedIn, validateReviews, CatchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  CatchAsync(reviews.deleteReview)
);

module.exports = router;
