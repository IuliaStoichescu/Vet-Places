const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Vetplace = require('../models/vetplaces');
const Review = require('../models/review')
const { joiSchema, reviewSchema } = require('../validatingSchemas.js')
const isLoggedIn = require('../logMiddleware.js');

const validateVetPlaces = (req, res, next) => {

   const { error } = joiSchema.validate(req.body);
   if (error) {
      const msg = error.details.map(e => e.message).join('.');
      throw new ExpressError(msg, 400)
   }
   else {
      next();
   }
}

router.get('/', catchAsync(async (req, res) => {
   const allVetPlaces = await Vetplace.find({});
   res.render('vetplaces/index', { allVetPlaces });
}))

router.get('/new', isLoggedIn, (req, res) => {

   res.render('vetplaces/new');
})

router.post('/', isLoggedIn, validateVetPlaces, catchAsync(async (req, res, next) => {
   // res.send(req.body);
   // if (!req.body) throw new ExpressError('Invalid Vet Place data!', 400);
   const vetplace = new Vetplace(req.body);
   await vetplace.save();
   req.flash('success', 'Successfully made a new vetplace!');
   res.redirect(`/vetplaces/${vetplace._id}`);
}))

router.get('/:id', catchAsync(async (req, res) => {
   const { id } = req.params;
   const vetplace = await Vetplace.findById(id).populate('reviews');
   if (!vetplace) {
      req.flash('error', 'Cannot find this vetplace')
      return res.redirect('/vetplaces');
   }
   res.render('vetplaces/show', { vetplace });
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
   const vetplace = await Vetplace.findById(req.params.id);
   if (!vetplace) {
      req.flash('error', 'Cannot find this vetplace')
      return res.redirect('/vetplaces');
   }
   res.render('vetplaces/edit', { vetplace })
}))

router.put('/:id', isLoggedIn, validateVetPlaces, catchAsync(async (req, res) => {
   const updatedPlace = await Vetplace.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
   req.flash('success', 'Successfully updated vetplace!');
   res.redirect(`/vetplaces/${updatedPlace._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
   await Vetplace.findByIdAndDelete(req.params.id);
   res.redirect('/vetplaces')
}))

module.exports = router