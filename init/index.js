const mongoose = require("mongoose");
const Listing = require("../models/listing.js");    // Moves up one directory level.Use this to navigate to the parent directory of the current file's directory.
const initData = require("./data.js");

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

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner : "66fb49496040452659b25756"}));       // copying object and adding owner property in DB.
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();