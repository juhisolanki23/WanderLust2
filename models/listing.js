const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title :{
       type:  String,
       required : true,
    },
    description : {
     type:  String,
    required : true,
},

    image : {
        type : String,
        default :"https://unsplash.com/photos/the-sun-shines-through-the-trees-in-the-forest-Dam6wttlP28", 
        set : (v)=>v === "" ? "https://unsplash.com/photos/the-sun-shines-through-the-trees-in-the-forest-Dam6wttlP28" : v,
    },
    price : Number,
    location : String,
    country : String,
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;