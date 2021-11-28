const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewfarm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = (geoData.body.features[0].geometry);
    campground.image = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    // const fpro = await Campground.findById(id);
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', populate: {
            path: 'author'
        }
    }).populate('author')
    console.log(campground)
    if (!campground) {
        req.flash('error', "Can't find it")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditfarm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', "Can't find it")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }))
    campground.image.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })

    }
    // if (req.body.deleteImages) {
    //     for (let filename of req.body.deleteImages) {
    //         await cloudinary.uploader.destroy(filename);
    //     }
    //     await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    // }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted")
    res.redirect('/campgrounds')
}

// https://cloudinary.com/console/c-7f127e5a5455c6ffe38100a6536d6f/media_library/folders/bead917aee890fb2c9023c27bec2496789/asset/ed49fd5c2bb84a5fb7b8bfbd51e11f27/manage