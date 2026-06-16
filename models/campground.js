const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema
const User = require('./user')
const { coordinates } = require('@maptiler/client')

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    const imageUrl = this.images && this.images.length
        ? this.images[0].url
        : 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=300&fit=crop';
    return `
    <div style="width: 350px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
        <img src="${imageUrl}" style="height: 250px; object-fit: cover; width: 100%;" alt="${this.title}">
        <div style="padding: 16px; background: white;">
            <h5 style="margin: 0 0 12px 0;">
                <a href="/campgrounds/${this._id}" style="text-decoration: none; color: #000000; font-weight: bold; font-size: 1.1rem;">
                    ${this.title}
                </a>
            </h5>
            <h6 style="margin: 6px 0; color: #333; font-size: 0.95rem;"><b>Location:</b> ${this.location}</h6>
            <h6 style="margin: 6px 0 12px 0; color: #333; font-weight: bold; font-size: 0.95rem;"><b>Price:</b> <span style="color: #5fb586;">${this.price}$</span> per night</h6>
            <p style="margin: 0; color: #555; font-size: 0.9rem; line-height: 1.5;">${this.description.substring(0, 120)}...</p>
        </div>
    </div>`
});

CampgroundSchema.virtual('averageRating').get(function () {
    if (this.reviews && this.reviews.length > 0) {
        const totalRating = this.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        return (totalRating / this.reviews.length).toFixed(1);
    }
    return 0;
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)