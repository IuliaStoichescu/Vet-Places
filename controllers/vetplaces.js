const Vetplace = require('../models/vetplaces');

module.exports.index = async (req, res) => {
   const allVetPlaces = await Vetplace.find({});
   res.render('vetplaces/index', { allVetPlaces });
}

module.exports.new = (req, res) => {
   res.render('vetplaces/new');
}

module.exports.createVet = async (req, res, next) => {
   // res.send(req.body);
   // if (!req.body) throw new ExpressError('Invalid Vet Place data!', 400);
   const vetplace = new Vetplace(req.body);
   vetplace.author = req.user._id;
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
   const vetplaces = await Vetplace.findById(id);
   if (!vetplaces) {
      req.flash('error', 'Cannot find this vetplace')
      return res.redirect('/vetplaces');
   }
   res.render('vetplaces/edit', { vetplace })
}

module.exports.renderEditForm = async (req, res) => {
   const { id } = req.params;
   const updatedPlace = await Vetplace.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
   req.flash('success', 'Successfully updated vetplace!');
   res.redirect(`/vetplaces/${updatedPlace._id}`)
}

module.exports.deleteVet = async (req, res) => {
   const { id } = req.params;
   await Vetplace.findByIdAndDelete(id);
   req.flash('success', 'Succesfully deleted vetplace!');
   res.redirect('/vetplaces')
}