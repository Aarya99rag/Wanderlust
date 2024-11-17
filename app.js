if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
  }
  

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");   
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");    // The ./ means "starting from the current directory"."If your current file is located at /Wanderlust/app.js, then ./utils/ExpressError.js refers to /Wanderlust/utils/ExpressError.js."
const MongoStore = require('connect-mongo');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const db_connect = process.env.ATLAS_CONCC;

//express router for listings 
const listingRouter = require("./routes/listings.js") 
const reviewRouter = require("./routes/reviews.js")   
const userRouter = require("./routes/user.js");    



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
    await mongoose.connect(db_connect);
}



// app.get("/", (req,res)=>{
//     res.send("Hi, I am root");
// });


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

const store = MongoStore.create({
    mongoUrl: db_connect,
    crypto:{
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Error in mongo session store", err);
});



const sessionOptions = {
    store,
    secret : process.env.SECRET,
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


// using express router for all "listings" related routes. All routes starting with or have "/listings" common are grouped together in listings.js in routes folder.
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter)   //the "id" parameter present here stays within the app.js file itself, it does not reach reviews.js. thats why after "console.log(req.params.id);" it prints undefined. But parameters ahead of this "id" do get delivered to reviews.js. We need this "id" parameter as well to reach reviews.js, so we use external option called "mergeParams". 
// parent route : "/listings/:id/reviews" (common part), child route : "/ or /:reviewId (remaining part)".
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