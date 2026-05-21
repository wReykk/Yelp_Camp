const Review = require('../models/review.js')
const Campground = require('../models/campground')

module.exports.createReview = async (req, res) => {
    const camps = await Campground.findById(req.params.id)
    const newReview = new Review(req.body.review)
    newReview.author = req.user._id
    camps.reviews.push(newReview)
    await newReview.save()
    await camps.save()
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${camps._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    const camps = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Deleted review')
    res.redirect(`/campgrounds/${camps._id}`)

}