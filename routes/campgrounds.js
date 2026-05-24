const express = require('express')
const router = express.Router()
const Review = require('../models/review.js')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, validateCampground, isAuthor } = require('../middlewares.js')
const campgrounds = require('../controllers/campgrounds.js')
const multer = require('multer')
const { storage } = require('../cloudinary/index.js')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCamp))
// .post(upload.array('image'), (req, res) => {

// })

router.get('/create', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCamp))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCamp))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCamp))

router.get('/:id/edit', isLoggedIn, isAuthor, campgrounds.renderEditForm)



module.exports = router