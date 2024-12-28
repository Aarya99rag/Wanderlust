const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js"); //../ move up to parent directory
const router = express.Router();
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/category").get(wrapAsync(listingController.categories));

router.route("/search").get(wrapAsync(listingController.search));

router
  .route("/")
  // Print all the Listings(apartments,hotels,villas,etc) - Index Route
  .get(wrapAsync(listingController.index))
  // data inserted in db for newly created listing.
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.storeListing)
  );

// New Route
// create new listing. form to fill in details
// keep this route above ":/id" route as server can mistaken "/new" as "id" and can potentially lead to an error.
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Edit Route
// Edit Route form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

router
  .route("/:id")
  // Print detailed data for location - Show route
  .get(wrapAsync(listingController.showListing))
  // Update changes in db for edited listing.
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  // Destroy Route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
