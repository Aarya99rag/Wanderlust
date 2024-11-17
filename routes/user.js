const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
  .route("/signup")
  // Display signup form
  .get(userController.renderSignupForm)
  // store user in DB
  .post(wrapAsync(userController.signUpUser));

router
  .route("/login")
  // Display login form
  .get(userController.renderloginForm)
  // authenticate user by checking username and password entry in DB using local Strategy.
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.loginUser
  );

// logout user
router.get("/logout", userController.logout);

module.exports = router;
