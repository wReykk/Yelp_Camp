const express = require('express')
const router = express.Router()
const ExpressError = require('../utils/ExpressError')
const Review = require('../models/review.js')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { CampgroundSchema, reviewSchema } = require('../schemas.js')

const validateCampground = (req, res, next) => {
    const { error } = CampgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

router.get('/', async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
})

router.get('/create', (req, res) => {
    res.render('campgrounds/create')
})

router.post('/', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body) throw new ExpressError('Invalid Campground Data', 400)
    const newCamp = new Campground(req.body)
    await newCamp.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect('/campgrounds/' + newCamp._id)
    console.log(newCamp)
}))


router.get('/:id', catchAsync(async (req, res) => {
    const camps = await Campground.findById(req.params.id).populate('reviews')
    if (!camps) {
        req.flash('error', 'oops! Nothing was found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camps })
}))

router.get('/:id/edit', async (req, res) => {
    const camps = await Campground.findById(req.params.id)
    if (!camps) {
        req.flash('error', 'oops! Nothing was found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camps })
})

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camps = await Campground.findByIdAndUpdate(id, req.body, { runValidators: true, returnDocument: 'after' })
    req.flash('success', 'Successfully updated campground!')
    res.redirect('/campgrounds/' + camps._id)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Deleted Campground')
    res.redirect('/campgrounds')
}))

module.exports = router