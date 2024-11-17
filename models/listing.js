const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type : String,
        required : true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    category : {
        type : String,
        enum : ["Bedrooms","Iconic Cities","Treaking","Castles","Amazing Pools","Camping","Farms","Arctic","Beach","River","Cruise","Hotel","Trending","Haunting","Aquarium","Greenery","City","Temples","Tower","Archway"],
    },
    price: Number,
    location: String,
    country: String, 
    reviews : [     // refer review schema
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        }
    ],
    owner : {       // refer user schema
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    geometry : {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
          },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    
        // enum : ["Bedrooms","Iconic Cities","Treaking","Castles","Amazing Pools","Camping","Farms","Arctic","Beach","River","Cruise","Hotel"]
    
});

listingSchema.post("findOneAndDelete" , async(listing) => {
    if (listing) {
        await Review.deleteMany({_id:{$in : listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;


