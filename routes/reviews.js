const express = require('express')
const router = express.Router({ mergeParams: true })
const ExpressError = require('../utils/ExpressError')
const Review = require('../models/review.js')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { CampgroundSchema, reviewSchema } = require('../schemas.js')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middlewares.js')
const reviews = require('../controllers/reviews.js')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router