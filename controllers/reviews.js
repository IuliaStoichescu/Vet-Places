const Review = require('../models/review')
const Vetplace = require('../models/vetplaces');

module.exports.createReview = async (req, res, next) => {
   console.log('REQ.BODY:', req.body);
   const vetId = await Vetplace.findById(req.params.id);
   const review = new Review(req.body.reviews);
   review.author = req.user._id;
   vetId.reviews.push(review);
   await review.save();
   await vetId.save();
   req.flash('success', 'Successfully created a new review');
   res.redirect(`/vetplaces/${vetId._id}`);
}

module.exports.deleteReview = async (req, res, next) => {
   const { id, reviewId } = req.params;
   await Vetplace.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
   await Review.findByIdAndDelete(reviewId);
   req.flash('success', 'Successfully deleted review');
   res.redirect(`/vetplaces/${id}`);
}