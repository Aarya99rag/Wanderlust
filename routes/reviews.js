const express = require("express");  
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router({mergeParams : true});
const { isLoggedIn, isReviewAuther, validateReview } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js")


// REVIEWS
// Post Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.postReview));

// Delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuther, wrapAsync(reviewController.destroyReview))

module.exports = router;