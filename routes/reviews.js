const express = require('express')
const router = express.Router({ mergeParams: true })
const ExpressError = require('../utils/ExpressError')
const Review = require('../models/review.js')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { CampgroundSchema, reviewSchema } = require('../schemas.js')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const camps = await Campground.findById(req.params.id)
    const newReview = new Review(req.body.review)
    camps.reviews.push(newReview)
    await newReview.save()
    await camps.save()
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${camps._id}`)
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    const camps = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Deleted review')
    res.redirect(`/campgrounds/${camps._id}`)

}))


module.exports = router