const mongoose = require("mongoose");
const cities = require("./cities");
const Campground = require("../models/campgrounds");
const { places, descriptors } = require("./seedHelpers");
const dotenv = require('dotenv').config({path:'C:\Users\mirot\OneDrive\Misc\WD\YelpCamp\.env'});

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dn7i79nmi',
  api_key: '964971847774723',
  api_secret: 'r9nFM7hVx5a9qS1s2uovc8tCQZs',
  secure: true,
});


mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const searchImages = async() => { await cloudinary.search
  .expression(`folder:YelpCamp`)
  .execute()
  .then(res => {
    const sample = (array) => array[Math.floor(Math.random() * array.length)];
    const seedDB = async () => {
      await Campground.deleteMany({});
      for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20);
        const randomIndex = Math.floor(Math.random()*res.resources.length);
        const randomImage = res.resources[randomIndex];
        const camp = new Campground({
          location: `${cities[random1000].city}, ${cities[random1000].state}`,
          title: `${sample(descriptors)} ${sample(places)}`,
          author: '651cf4f4b75673d760734e89',
          description:
            "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusantium, voluptas?",
          images: [{
            url: randomImage.secure_url,
            filename: randomImage.filename,
          }],
          geometry:{
            type:'Point',
            coordinates: [
              cities[random1000].longitude,
              cities[random1000].latitude,
            ],
          },
          price: price,
          date: Date(),
        });
        await camp.save();
      }
    };
    
    seedDB().then(() => {
      db.close();
      console.log("Database Disconnected");
    });
  })
  .catch((error) => {
  console.error(error)
});
};
// const imgUrl =
//   "https://api.unsplash.com/photos/random?client_id=_bCmVKS_JDmBe2on-xssgblCxmiaCfx-7KnowAsbQ0c";

searchImages().then(() => {
  console.log('Done')
})