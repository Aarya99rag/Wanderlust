const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema({ 
    email : {
        type: String,
        required : true,
    },
});

userSchema.plugin(passportLocalMongoose);     // Add passport-local-mongoose plugin to handle hashing and salting the password

module.exports = mongoose.model("User", userSchema);