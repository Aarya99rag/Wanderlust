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
    console.log(req.path, "..", req.originalUrl);
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

