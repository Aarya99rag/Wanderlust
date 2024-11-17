const Listing = require("./models/listing.js"); 
const Review = require("./models/review.js");
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const {reviewSchema} = require("./schema.js");


//server side error handling 
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};


//server side error handling 
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};


// Middleware to check if user is authenticated(logged in) to access certain parts of website.        
module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.path, "..", req.originalUrl);
    if (!req.isAuthenticated()) {
        // Encode the URL before saving to the session
        req.session.redirectUrl = req.originalUrl;
        // console.log(encodeURIComponent(req.originalUrl))
        req.flash("error", "You have to log in first!");
        return res.redirect("/login");
    }
    next();
};


// Middleware to save redirectUrl into local variable.
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        // Decode the URL before assigning to res.locals
        res.locals.redirectUrl = req.session.redirectUrl;
        // console.log(decodeURIComponent(req.session.redirectUrl))
    }
    next();
};


// Middleware to check if owner is equal to current user
module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You dont have permission.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}; 


// Middleware to check who is the auther of the review
module.exports.isReviewAuther = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You dont have permission.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}; 

// req.path : path that we are trying to access before getting redirected to log in page.This is relative. EX "/new .. /listings/new" if user was trying to add new listing or "/66f1680144ff6039d6d9e807/edit" if user was trying to edit a listing.
// req.originalUrl : This is the complete URL. So basically this original URL is the URL we want to redirect user back to after logging her in. EX. "/listings/new" or "/listings/66f1680144ff6039d6d9e807/edit". 
// req.session.redirectUrl = req.originalUrl;      // we need to save this URL if and only if user is not logged in.Thats why we are saving URL in our session object in if condition. We are storing it in our session object bcoz all middlewares/functions will have access to it.
// console.log(req.session); Output is : 
// Session {
//     cookie: {
//       path: '/',
//       _expires: 2024-10-09T09:05:44.445Z,
//       originalMaxAge: 604800000,
//       httpOnly: true
//     },
//     flash: {},
//     redirectUrl: '/listings/new'
// }
// But this will cause an error bcoz Passport by default regenerates the session after a successful login for security reasons. This is a common security practice known as session fixation protection.Session fixation is a type of attack where an attacker sets a known session ID for a user before the user authenticates. After the user logs in, the attacker can use that session ID to hijack the user's authenticated session. To prevent this, Passport and many other authentication libraries regenerate the session (by creating a new session ID) after login.
// This effectively "resets" the session. During this regeneration, any custom session properties, such as req.session.redirectUrl, will be lost (Deleted).To preserve the redirectUrl across the session regeneration, you can temporarily store it in "res.locals" or another variable, then pass it to "/login" post route in user.js and res.redirect url and add our "saveRedirectUrl" just before passport.authenticate() that is before we do login process.
// Passport.js does not have direct access to res.locals because it mainly interacts with the req and session objects. So it cannot delete our variable from there. res.locals only lasts for the duration of the request-response cycle, so any information stored there would be lost after the request is completed. Passport, on the other hand, needs to manage persistent user sessions across multiple requests, which is why it uses req.session.
// Now theres another flaw in this. when we log in directly, then in this case out "isLoggedIn" middleware did not get triggered, if "isLoggedIn" didnt trigger, then "req.session.redirectUrl" never saved "req.originalUrl", then it also didnt get saved in "res.locals". Thats why the local Url that we passed in "/login" post route never existed (undefined) and we get page not found error. 
// Solution to this is, before directly passing "res.locals.redirectUrl" we first check the condition in a variable that , if "redirectUrl" exits in "res.locals" then save "res.locals.redirectUrl" as it is in new variable otherwise save "/listings" in that variable. Then pass that variable in res.redirect. => "let redirectUrl = res.locals.redirectUrl || "/listings"; res.redirect(redirectUrl);"