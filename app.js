const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const engine = require('ejs-mate');
// https://mongoosejs.com/docs/index.html
const wrapAsync = require("./utils/wrapAsyc.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const Review = require("./models/review.js")
// app.use(express.urlencoded ({extended : true}));


main()
.then(() =>{
    console.log("connected to db");
})
.catch((err) => {
    console.log(err)
});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname , "/public")));
// app.get ("/testListening" , async (req , res) =>{
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "By the beach",
//         price : 1200,
//         location : "Calangute , Goa",
//         county : "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");

// });
app.get("/", (req, res) =>{
    res.send("Hi, i am root");
});


const validateListing = (req ,res ,next) =>{
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((e) => e.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
};

//Index Route
// app.get("/listings", async (req , res) =>{
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings }); 
// });
app.get("/listings", wrapAsync(async (req , res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings }); 
})
);

//New Route
app.get("/listings/new" , (req , res) =>{
    res.render("listings/new.ejs");
});

//Show Route
// app.get("/listings/:id" , async(req , res) =>{
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/show.ejs" , { listing });
// });
app.get("/listings/:id" , wrapAsync(async(req , res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs" , { listing });
})
);

//Create Route
// app.post("/listings" , async (req , res , next) =>{
//     // let {title , description , image , price , country , location} = req.body;
//     try{
//         let listing = req.body.listing;
//     const newListing = new Listing(listing);
//     await newListing.save();
//     res.redirect("/listings");
//     }catch(err){
//         next(err);
//     }
//     // console.log(listing);
// });
app.post("/listings" ,validateListing,wrapAsync(async (req , res , next) =>{
    // let {title , description , image , price , country , location} = req.body;
    let listing = req.body.listing;
    // if(!listing){
    //     throw new ExpressError(400 ,"Send valid data for listings");
    // }
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
    
    // console.log(listing);
})
);
//Edit Route
app.get("/listings/:id/edit" , async (req , res) =>{
      let { id } = req.params;
      const listing = await Listing.findById(id);
      res.render("listings/edit.ejs" , { listing });

});

//Update Route
// app.put("/listings/:id" , async(req , res) =>{
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id , {...req.body.listing});
//     res.redirect(`/listings/${id}`);
// });
app.put("/listings/:id",validateListing, wrapAsync(async(req , res) =>{
    // if(!req.body.listing){
    //     throw new ExpressError(400 ,"Send valid data for listings");
    // }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
})
);

//Delete Route
app.delete("/listings/:id" , wrapAsync(async (req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})
);

//Reviews
//Post Route
app.post("/listings/:id/reviews" , async(req ,res) =>{
     let listing = await Listing.findById(req.params.id);
     let newReview = new Review(req.body.review);

     listing.reviews.push(newReview);

     await newReview.save();
     await listing.save();

     console.log("new review saved");
     res.send("new review saved");
});


app.all( "*" , (req, res ,next) =>{
    next(new ExpressError(404, "Page Not Found"));
});

// app.use((err , req ,res , next) =>{
//     res.send("something went wrong");
// });
// app.use((err , req ,res , next) =>{
//     let {statusCode =500 , message = "Something went wrong!"} = err;
//     // res.status(statusCode).send(message);
//     // res.render("error.ejs" , { message});
//     res.status(statusCode).render("error.ejs" , { message});
// });

app.listen(8080 , ()=>{
    console.log("server is listening to port 8080");
});