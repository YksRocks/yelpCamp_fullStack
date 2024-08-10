const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary/index");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
  try{
    const geoData = await geocoder
      .forwardGeocode({ query: req.body.campground.location, limit: 1 })
      .send();
    const campground = new Campground(req.body.campground);
    console.log("hi");
    campground.geometry = geoData.body.features[0].geometry;
    console.log("hii");
    campground.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    console.log("hiii");
    campground.author = req.user._id;
    console.log("hiiio");
    await campground.save();
    console.log("hiiiop");
    console.log(campground);
    req.flash("success", "Successfully created a new campgrounds");
    res.redirect(`/campgrounds/${campground._id}`);
  }catch(error){
    console.log(error);
  }
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campgrounds = await Campground.findOne({ _id: id })
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campgrounds) {
    req.flash("error", "Campground Not Found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campgrounds });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground Not Found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    { _id: id },
    { ...req.body.campground }
  );
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully editted the campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  for (let img of campground.images) {
    await cloudinary.uploader.destroy(img.filename);
  }
  const deleteCampground = await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the campground");
  res.redirect("/campgrounds");
};
