const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync")
const { validateReview, isLoggedIn, isReviewer } = require("../middleware");
const reviews = require("../controllers/reviews");

router.post(
    "/",
    validateReview,
    isLoggedIn,
    catchAsync(reviews.createReview)
);

router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewer,
    catchAsync(reviews.deleteReview)
);

module.exports = router;