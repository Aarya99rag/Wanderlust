const User = require("../models/user.js");


module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
}


module.exports.signUpUser = async(req,res)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email , username});
        const registeredUser = await User.register(newUser, password);
        // console.log(registeredUser);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust !");
            res.redirect("/listings");
    })}catch(err){
        req.flash("error", err.message);
        res.redirect("/signup");
    };
}


module.exports.renderloginForm = (req,res)=>{
    res.render("users/login.ejs");
}


module.exports.loginUser = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    
    // Check if the redirectUrl exists in res.locals, otherwise default to "/listings"
    let redirectUrl = res.locals.redirectUrl || "/listings";
    // console.log(redirectUrl);
    res.redirect(redirectUrl);
}


module.exports.logout =  (req, res, next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out !");
        res.redirect("/listings");
    });
}