const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");   
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");    
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");


//express router for listings 
const listingRouter = require("./routes/listings.js") 
const reviewRouter = require("./routes/reviews.js")   
const userRouter = require("./routes/user.js")    


app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")))


main()
.then(()=>{
    console.log("Connection Successful");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}


app.get("/", (req,res)=>{
    res.send("Hi, I am root");
});


// app.get("/testlisting", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the River",
//         price: 1200,
//         location: "Calangute",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });


const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};

app.use(session(sessionOptions));
app.use(flash());   // use flash before our routes.


app.use(passport.initialize());     //write this after using session
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "delta-student",
//     });
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter)   
app.use("/", userRouter);



//Error handling middlewares.(Always keep at end of entire code.)
app.all("*", (req,res,next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

//CLient side Error handling middleware
app.use((err,req,res,next)=>{
    let {statusCode = 500 , message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs" , {message});
    // res.status(statusCode).send(message);
})


app.listen(8080, ()=>{
    console.log("app listening to port 8080");
});
