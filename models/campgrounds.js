const { json } = require("body-parser");
const mongoose = require("mongoose");
const { object } = require("webidl-conversions");
const Schema = mongoose.Schema;
const Review = require("./reviews");
const { array } = require("joi");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/c_thumb,g_face,h_200,w_200');
})

const opts = {toJSON:{virtuals:true}};

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  location: String,
  images: [ImageSchema],
  date: Date,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
},opts);

//doc ==> campground that the action is being performed on
CampgroundSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0,50)}...</p>`;
})

module.exports = mongoose.model("Campground", CampgroundSchema);
