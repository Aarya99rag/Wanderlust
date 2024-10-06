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
    .populate("owner");      
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
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });   
    req.flash("success","Listing has been updated Successfully !");
    res.redirect(`/listings/${id}`);
}


module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing has been deleted successfully !");
    res.redirect("/listings");
}
