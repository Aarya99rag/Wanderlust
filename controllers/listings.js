const Listing = require("../models/listing.js"); 


module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}


module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}


module.exports.storeListing = async (req,res,next)=>{
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success","New Listing Created !");
    res.redirect("/listings");
}


module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate : {
            path: "author",
        },
    })
    .populate("owner");       //populate method is used to fill or replace a referenced field in one document with the actual data from another related document. It's commonly used when you're dealing with relationships between collections, such as one-to-many or many-to-many relationships.For example, let's say you have two collections: User and Post. Each Post might have a user field that references a document in the User collection. Using populate, you can replace that reference with the actual user data when querying posts.
    if(!listing){
        req.flash("error" , "Listing you requested for does not exist !");
        res.redirect("/listings");
    };
    // console.log(listing);
    res.render("listings/show.ejs", {listing}); 
}


module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing you requested for does not exist !");
        res.redirect("/listings");
    };
    res.render("listings/edit.ejs", {listing});
}


module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });   // { ...req.body.listing } creates a new object and spreads (copies) all properties from req.body.listing into this new object.
    req.flash("success","Listing has been updated Successfully !");
    res.redirect(`/listings/${id}`);
}


module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing has been deleted successfully !");
    res.redirect("/listings");
}