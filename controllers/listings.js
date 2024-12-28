const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({}).sort({ _id: -1 });
  // want the newest documents to appear first, you can take advantage of MongoDB’s natural sorting by the _id field. The default _id field in MongoDB contains a timestamp embedded within it, which can be used for sorting documents by their insertion time. The _id field in MongoDB is an ObjectId that includes a timestamp of when the document was created. To retrieve documents in the order of their insertion, with the newest appearing first, you can sort by the _id field in descending order. _id Field: The default field that is added to every document in MongoDB. It’s an ObjectId type that contains a 4-byte timestamp as its first component. Sorting by _id: Sorting by _id in descending order (-1) will order documents based on their insertion time, with the most recently inserted documents appearing first.
  // Structure of ObjectId:
  // An ObjectId is a 12-byte identifier typically represented as a 24-character hexadecimal string. The structure is as follows:

  // 4-byte timestamp:

  // Represents the Unix timestamp (in seconds) of when the ObjectId was generated.
  // This timestamp allows for sorting documents by creation time without additional fields.
  // 5-byte random value:

  // Ensures uniqueness among different machines.
  // Generated using a machine identifier and process ID.
  // 3-byte incrementing counter:

  // Starts with a random value and increments with each new ObjectId generated.
  // Ensures uniqueness even if multiple ObjectIds are created within the same second.

  // 64b8f1c9c2e27e29f0a12345
  // Timestamp: 64b8f1c9 (first 4 bytes)
  // Machine Identifier and Process ID: c2e27e29f0a1 (next 5 bytes)
  // Counter: 2345 (last 3 bytes)

  res.render("listings/index.ejs", { allListings });
};

module.exports.categories = async (req, res) => {
  let type = req.query.type;
  let lists = await Listing.find({ category: type });
  // console.log(lists);
  res.render("listings/category.ejs", { lists });
};

module.exports.search = async (req, res) => {
  let { query } = req.query;
  let lists = await Listing.find({
    $or: [
      { title: { $regex: new RegExp(query, "i") } },
      { location: { $regex: new RegExp(query, "i") } },
      { country: { $regex: new RegExp(query, "i") } },
    ],
  });
  if(!lists){
    return res.send("No lists Found")
  }
  res.render("listings/category.ejs", {lists})
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.storeListing = async (req, res, next) => {
  // Geocoding API
  // console.log(req.body);
  const address = req.body.listing.location;
  const apikey = process.env.MAP_API_KEY;
  try {
    const response = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
        address
      )}&apikey=${apikey}`
    );
    const data = await response.json();
    // console.log(data);
    if (data.items && data.items.length > 0) {
      const location = data.items[0].position;
      // console.log(`Latitude: ${location.lat}, Longitude: ${location.lng}`);
      // Construct a GeoJSON object
      const geoJson = {
        type: "Point",
        coordinates: [location.lng, location.lat],
      };
      // Print the GeoJSON object
      // console.log("GeoJSON Format:", JSON.stringify(geoJson, null, 2));
      let url = req.file.path;
      let filename = req.file.filename;
      const newlisting = new Listing({
        ...req.body.listing,
        owner: req.user._id,
        image: { url, filename },
        geometry: geoJson,
      });
      // newlisting.owner = req.user._id;
      // newlisting.image = { url, filename };
      let GeoListing = await newlisting.save();
      // console.log(GeoListing);
      req.flash("success", "New Listing Created !");
      res.redirect("/listings");
    } else {
      console.log("No results found");
    }
  } catch (error) {
    console.error("Error during geocoding:", error);
  }
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner"); //populate method is used to fill or replace a referenced field in one document with the actual data from another related document. It's commonly used when you're dealing with relationships between collections, such as one-to-many or many-to-many relationships.For example, let's say you have two collections: User and Post. Each Post might have a user field that references a document in the User collection. Using populate, you can replace that reference with the actual user data when querying posts.
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist !");
    res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist !");
    res.redirect("/listings");
  }
  let OriginalListingImage = listing.image.url;
  OriginalListingImage = OriginalListingImage.replace(
    "/upload",
    "/upload/h_250,w_350"
  );
  res.render("listings/edit.ejs", { listing, OriginalListingImage });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // { ...req.body.listing } creates a new object and spreads (copies) all properties from req.body.listing into this new object.
  if (typeof req.file !== "undefined") {
    let filename = req.file.filename;
    let url = req.file.path;
    listing.image = { filename, url };
    await listing.save();
  }
  req.flash("success", "Listing has been updated Successfully !");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing has been deleted successfully !");
  res.redirect("/listings");
};
