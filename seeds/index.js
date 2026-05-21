const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log('Database Connected')
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '6a00fbcc47911cf896b9a1c7',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dnv29dzc3/image/upload/v1778776162/YelpCamp/vuzercldmio4m56p8l3x.jpg',
                    filename: 'YelpCamp/vuzercldmio4m56p8l3x',
                },
                {
                    url: 'https://res.cloudinary.com/dnv29dzc3/image/upload/v1778776162/YelpCamp/dj5hi8jojgba43aix3ci.jpg',
                    filename: 'YelpCamp/dj5hi8jojgba43aix3ci',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Reiciendis vel id totam perferendis quidem sit commodi, doloremque quia modi accusantium non suscipit placeat voluptatum blanditiis? Voluptatem animi fugit quisquam quis. Sint, minus reiciendis impedit nihil fugit in explicabo quia soluta ratione optio voluptate accusantium maxime possimus labore assumenda quos porro et cum cupiditate reprehenderit suscipit ea pariatur minima sed? Animi! Consequuntur nesciunt atque ipsum possimus culpa magni? Dolore iste similique nemo molestias nihil asperiores nesciunt dolorum, vero cupiditate, quo illo maiores a voluptatibus labore aliquid tempore ipsam placeat odio nulla?',
            price
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})