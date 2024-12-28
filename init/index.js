const path = require("path");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
}

  
  const mongoose = require("mongoose");
  const Listing = require("../models/listing.js");
  const initData = require("./data.js");
  
  const db_connect = process.env.ATLAS_CONCC;
  
  async function main() {
    if (!db_connect) {
      throw new Error("MongoDB connection string is not defined.");
    }
    await mongoose.connect(db_connect, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  
  main()
    .then(() => {
      console.log("Connection Successful");
      console.log("Connecting to MongoDB with URI:", db_connect);
      return initDB(); // Wait for database initialization
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
  
  async function initDB() {
    try {
      await Listing.deleteMany({});
      initData.data = initData.data.map((obj) => ({ ...obj, owner: "67399037cbcbb1e491fd2ae2" }));
      await Listing.insertMany(initData.data);
      console.log("Data was initialized");
    } catch (error) {
      console.error("Error during database initialization:", error);
    }
  }
  