const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

const multer = require("multer");
const upload = multer();

app.use(upload.none());

const  MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";


main().then(()=>{
    console.log("connected to DB!");
})
.catch(err => console.log(err));


async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
app.get("/",(req,res)=>{
    res.send("Hi,I am Root!");
})
//Show Route
app.get("/listings/:id",wrapAsync( async (req,res)=>{
    let {id}  = req.params;
   const listing = await Listing.findById(id);
   res.render("listings/show.ejs",{listing});
}));
//create Route
app.post(
    "/listings",validateListing,
    wrapAsync(async(req,res,next)=>{
    const newListing =  new Listing(req.body.listing);
    await newListing.save();
     res.redirect("/listings");
}));

//Edit route
app.get("/listings/:id/edit", wrapAsync( async(req,res)=>{
    let {id}  = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
app.put("/listings/:id",
wrapAsync( async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    let {id}  = req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
   res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync( async (req,res)=>{
    let {id}  = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));


const validateListing = (req,res,next) =>{
    let {error }=  listingSchema.validate(req.body);
     if(error){
      throw new ExpressError(400,result.error);
    }else{
        next();
    }
};



//Index Route
app.get("/listings",wrapAsync( async(req,res)=>{
 const allListings =   await Listing.find({});
 res.render("listings/index.ejs",{allListings});
    }));

/*app.get("/testListing", async (req,res)=>{
    let sampleListing = new Listing({
        title : "My new Villa",
        description : "By the beach",
        price : 1200,
        location : "Calanguate, Goa",
        country : "India",
    });
    await sampleListing.save();
    console.log("Sample was saved");
    res.send("successful testing");
});*/

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode =500,message = "Something went wrong!"} = err;
   // res.status(statusCode).send(message);
   res.status(statusCode).render("err.ejs",{message});
});

app.listen(8080,(req,res)=>{
    console.log("Server is listening on port 8080");
})