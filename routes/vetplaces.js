const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Vetplace = require('../models/vetplaces');
const Review = require('../models/review')
const { joiSchema, reviewSchema } = require('../validatingSchemas.js')
const isLoggedIn = require('../logMiddleware.js');
const vetplaces = require('../controllers/vetplaces.js');

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

const isAuthor = async (req, res, next) => {
   const { id } = req.params;
   const vetplace = await Vetplace.findById(id);
   if (!vetplace.author.equals(req.user._id)) {
      req.flash('error', 'You dont have permission to edit this vet place!');
      return res.redirect(`/vetplaces/${id}`);
   }
   next();
}

router.route('/')
   .get(catchAsync(vetplaces.index))
   .post(isLoggedIn, validateVetPlaces, catchAsync(vetplaces.createVet));

router.get('/new', isLoggedIn, vetplaces.new)

router.route('/:id')
   .get(catchAsync(vetplaces.showVet))
   .put(isLoggedIn, isAuthor, validateVetPlaces, catchAsync(vetplaces.renderEditForm))
   .delete(isLoggedIn, isAuthor, catchAsync(vetplaces.deleteVet));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(vetplaces.editVet))

module.exports = router