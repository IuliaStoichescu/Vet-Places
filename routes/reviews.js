const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review')
const Vetplace = require('../models/vetplaces');
const ExpressError = require('../utils/ExpressError');
const { joiSchema, reviewSchema } = require('../validatingSchemas.js')
const isLoggedIn = require('../logMiddleware.js');
const { isReviewAuthor } = require('../logMiddleware.js');

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

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res, next) => {
   console.log('REQ.BODY:', req.body);
   const vetId = await Vetplace.findById(req.params.id);
   const review = new Review(req.body.reviews);
   review.author = req.user._id;
   vetId.reviews.push(review);
   await review.save();
   await vetId.save();
   req.flash('success', 'Successfully created a new review');
   res.redirect(`/vetplaces/${vetId._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res, next) => {
   const { id, reviewId } = req.params;
   await Vetplace.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
   await Review.findByIdAndDelete(reviewId);
   req.flash('success', 'Successfully deleted review');
   res.redirect(`/vetplaces/${id}`);
}))

module.exports = router;