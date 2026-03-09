const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review')
const Vetplace = require('../models/vetplaces');
const ExpressError = require('../utils/ExpressError');
const { joiSchema, reviewSchema } = require('../validatingSchemas.js')
const isLoggedIn = require('../logMiddleware.js');
const { isReviewAuthor } = require('../logMiddleware.js');
const reviews = require('../controllers/reviews.js')
const validateReview = (req, res, next) => {
   const { error } = reviewSchema.validate(req.body);
   if (error) {
      const msg = error.details.map(e => e.message).join('.');
      throw new ExpressError(msg, 400)
   }
   else {
      next();
   }
}

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;