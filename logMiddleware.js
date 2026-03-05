const Review = require('./models/review');

const isLoggedIn = (req, res, next) => {
   console.log("User info: ", req.user);
   if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'You must be signed in!')
      return res.redirect('/login');
   }
   next();
};

const storeReturnTo = (req, res, next) => {
   if (req.session.returnTo) {
      res.locals.returnTo = req.session.returnTo;
   }
   next();
}

const isReviewAuthor = async (req, res, next) => {
   const { id, reviewId } = req.params;
   const review = await Review.findById(reviewId);
   if (!review.author.equals(req.user._id)) {
      req.flash('error', 'You dont have permission to edit this vet place!');
      return res.redirect(`/vetplaces/${id}`);
   }
   next();
}


module.exports = isLoggedIn;
module.exports.storeReturnTo = storeReturnTo;
module.exports.isReviewAuthor = isReviewAuthor;