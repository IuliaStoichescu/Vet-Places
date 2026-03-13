const Vetplace = require('../models/vetplaces');
const cloudinary = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
   const allVetPlaces = await Vetplace.find({});
   res.render('vetplaces/index', { allVetPlaces });
}

module.exports.new = (req, res) => {
   res.render('vetplaces/new');
}

module.exports.createVet = async (req, res, next) => {
   console.log(req.body);
   // res.send(req.body);
   // if (!req.body) throw new ExpressError('Invalid Vet Place data!', 400);
   // geoData.body.features[0].geometry.coordinates

   const vetplace = new Vetplace(req.body);
   vetplace.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
   vetplace.author = req.user._id;
   req.body.location = req.body.location + ', ' + req.body.street;
   vetplace.location = vetplace.location + ', ' + req.body.street;
   const geoData = await geocoder.forwardGeocode({
      query: req.body.location,
      limit: 1
   }).send()
   vetplace.geometry = geoData.body.features[0].geometry;
   console.log(req.body);
   await vetplace.save();
   req.flash('success', 'Successfully made a new vetplace!');
   res.redirect(`/vetplaces/${vetplace._id}`);
}

module.exports.showVet = async (req, res) => {
   const { id } = req.params;
   const vetplace = await Vetplace.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
   if (!vetplace) {
      req.flash('error', 'Cannot find this vetplace')
      return res.redirect('/vetplaces');
   }
   res.render('vetplaces/show', { vetplace });
}

module.exports.editVet = async (req, res) => {
   const { id } = req.params;
   const vetplace = await Vetplace.findById(id);
   if (!vetplace) {
      req.flash('error', 'Cannot find this vetplace')
      return res.redirect('/vetplaces');
   }
   res.render('vetplaces/edit', { vetplace })
}

module.exports.renderEditForm = async (req, res) => {
   const { id } = req.params;
   const updatedPlace = await Vetplace.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
   const img = req.files.map(f => ({ url: f.path, filename: f.filename }));
   updatedPlace.images.push(...img);
   if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
         await cloudinary.cloudinary.uploader.destroy(filename);
      }
      await updatedPlace.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
   }
   await updatedPlace.save();
   req.flash('success', 'Successfully updated vetplace!');
   res.redirect(`/vetplaces/${updatedPlace._id}`)
}

module.exports.deleteVet = async (req, res) => {
   const { id } = req.params;
   await Vetplace.findByIdAndDelete(id);
   req.flash('success', 'Succesfully deleted vetplace!');
   res.redirect('/vetplaces')
}