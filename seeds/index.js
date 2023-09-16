const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const { images } = require("./seedImages");
const mongoose = require("mongoose");

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelpCamp");
}

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i <= 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const randomPrice = Math.floor(Math.random() * 20) + 10;
    const randomImage = Math.floor(Math.random() * 15);
    const camp = new Campground({
      author: "64fce31dab78f10b65bf4eb5",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dwtytn7fl/image/upload/v1694702393/YelpCamp/q5y7ncciihwtrhnfbozp.jpg",
          filename: "YelpCamp/qpeist780k6bsjpfawmn",
        },
        {
          url: "https://res.cloudinary.com/dwtytn7fl/image/upload/v1694702394/YelpCamp/mbpgdjz64r5agu1skx7o.jpg",
          filename: "YelpCamp/afy5xo30ovcttcrit654",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, quasi. Saepe corporis unde itaque adipisci pariatur, voluptates magni dolorem nemo officia amet labore optio omnis ipsum odit. Consectetur, obcaecati suscipit?",
      price: randomPrice,
    });
    await camp.save();
  }
};

seedDb().then(() => {
  mongoose.connection.close();
});
