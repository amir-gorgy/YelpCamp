const mongoose = require("mongoose");
const cities = require("./cities");
const Campground = require("../models/campgrounds");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

// async function getNewImage() {
//   return fetch(
//     "https://api.unsplash.com/photos/random?client_id=_bCmVKS_JDmBe2on-xssgblCxmiaCfx-7KnowAsbQ0c"
//   )
//     .then((response) => response.json)
//     .then((data) => {
//       return data.results.urls.regular;
//     });
// }

// const imgUrl =
//   "https://api.unsplash.com/photos/random?client_id=_bCmVKS_JDmBe2on-xssgblCxmiaCfx-7KnowAsbQ0c";

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20);
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      author: '651cf4f4b75673d760734e89',
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusantium, voluptas?",
      images: [{
        url: "https://res.cloudinary.com/dn7i79nmi/image/upload/v1697588269/YelpCamp/wmq7acpwrcavmshixa5r.jpg",
        filename: "YelpCamp/wmq7acpwrcavmshixa5r",
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
