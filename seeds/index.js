//const express = require('express');
//const path = require('path');
const mongoose = require('mongoose');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once("open", () => {
  console.log('Database Connected')
});

const sample = array => array[Math.floor(Math.random() * array.length)];

//array[Math.floor(Math.random() * array.length)]

const seeddb = async () => {
  await Campground.deleteMany({});
  // const c = new Campground({ title: 'Purple Field', })
  // await c.save();
  for (let i = 0; i < 100; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 30) + 10
    const camp = new Campground({
      author: '619a3597aac3f82e31753b83',
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab porro velit asperiores aperiam cupiditate saepe quod veritatis molestias, dolor corporis dolorum pariatur nostrum, eveniet laudantium omnis quisquam officiis commodi. Similique.',
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      image: [
        {
          url: 'https://res.cloudinary.com/tmkoc/image/upload/v1637916223/Yelpcamp/psmwy7uvqiywvr2xpnf5.png',
          filename: 'Yelpcamp/psmwy7uvqiywvr2xpnf5',
        },
        {
          url: 'https://res.cloudinary.com/tmkoc/image/upload/v1637916223/Yelpcamp/wk2j1qdofamwqmignizg.png',
          filename: 'Yelpcamp/wk2j1qdofamwqmignizg',
        },
        {
          url: 'https://res.cloudinary.com/tmkoc/image/upload/v1637916224/Yelpcamp/m0b2su1gzmi9eu0ubn16.png',
          filename: 'Yelpcamp/m0b2su1gzmi9eu0ubn16',
        }
      ]

    })
    await camp.save();
  }
}
seeddb().then(() => mongoose.connection.close());