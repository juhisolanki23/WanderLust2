const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
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

//Show Route
app.get("/listings/:id", async (req,res)=>{
    let {id}  = req.params;
   const listing = await Listing.findById(id);
   res.render("listings/show.ejs",{listing});
})
//create Route
app.post("/listings",async(req,res,next)=>{
  try{
    const newListing =  new Listing(req.body.listing);
    await newListing.save();
     res.redirect("/listings");
     console.log(newListing);
}catch(err){
    next(err);
}

})

//Edit route
app.get("/listings/:id/edit", async(req,res)=>{
    let {id}  = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})

//Update Route
app.put("/listings/:id",async(req,res)=>{
    let {id}  = req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
   res.redirect(`/listings/${id}`);
})

//Delete Route
app.delete("/listings/:id",async (req,res)=>{
    let {id}  = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})


//Index Route
app.get("/listings",async(req,res)=>{
 const allListings =   await Listing.find({});
 res.render("listings/index.ejs",{allListings});
    });

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
app.use((err,req,res,next)=>{
    res.send("something went wrong");
});

app.get("/",(req,res)=>{
    res.send("Hi,I am Root!");
})



app.listen(8080,(req,res)=>{
    console.log("Server is listening on port 8080");
})