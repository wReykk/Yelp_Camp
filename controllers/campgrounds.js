if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ quiet: true })
}


const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary/index')

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/create')
}

module.exports.createCamp = async (req, res) => {

    console.log("Multer:", req.files);
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
    // if (!req.body) throw new ExpressError('Invalid Campground Data', 400)
    const newCamp = new Campground(req.body.campground)
    newCamp.geometry = geoData.features[0].geometry
    newCamp.location = geoData.features[0].place_name
    newCamp.images = req.files.map(f => ({ url: f.secure_url, filename: f.public_id }))
    newCamp.author = req.user._id
    await newCamp.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect('/campgrounds/' + newCamp._id)
    console.log(newCamp)
}

module.exports.showCamp = async (req, res) => {
    const camps = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!camps) {
        req.flash('error', 'oops! Nothing was found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camps })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const camps = await Campground.findById(req.params.id)
    if (!camps) {
        req.flash('error', 'oops! Nothing was found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camps })
}

module.exports.editCamp = async (req, res) => {
    const { id } = req.params;
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
    const camps = await Campground.findByIdAndUpdate(id, req.body, { runValidators: true, returnDocument: 'after' })
    camps.geometry = geoData.features[0].geometry
    camps.location = geoData.features[0].place_name
    const imgs = req.files.map(f => ({ url: f.secure_url, filename: f.public_id }))
    camps.images.push(...imgs)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await camps.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await camps.save()
    req.flash('success', 'Successfully updated campground!')
    res.redirect('/campgrounds/' + camps._id)
}

module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Deleted Campground')
    res.redirect('/campgrounds')
}