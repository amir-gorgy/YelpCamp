const Campground = require("../models/campgrounds");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.newForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.newCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // console.log(geoData.body.features[0].geometry.coordinates);
    // res.send('ok');
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.editForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', "Can't find requested campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    if (!campground) {
        req.flash('error', "Can't find requested campground!");
        return res.redirect("/campgrounds");
    }
    req.flash('success', 'Successfully deleted campground')
    res.redirect("/campgrounds");
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if (!camp) {
        req.flash('error', "Can't find requested campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { camp });
};

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        {
            runValidators: true,
        }
    );
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy();
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(campground);
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};
