const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Vetplace = require('./models/vetplaces');
var morgan = require('morgan');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { joiSchema, reviewSchema } = require('./validatingSchemas.js')
const Review = require('./models/review')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

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

mongoose.connect('mongodb://127.0.0.1:27017/vetPlaces')
   .then(() => {
      console.log("Succesfully Mongo connected to port 27017")
   })
   .catch(err => {
      console.log("Oh no !! Error: ", err);
   })

app.get('/', (req, res) => {
   res.render('home');
})

app.get('/vetplaces', catchAsync(async (req, res) => {
   const allVetPlaces = await Vetplace.find({});
   res.render('vetplaces/index', { allVetPlaces });
}))

app.get('/vetplaces/new', (req, res) => {
   res.render('vetplaces/new');
})

app.post('/vetplaces', validateVetPlaces, catchAsync(async (req, res, next) => {
   // res.send(req.body);
   // if (!req.body) throw new ExpressError('Invalid Vet Place data!', 400);
   const vetplace = new Vetplace(req.body);
   await vetplace.save();
   res.redirect(`/vetplaces/${vetplace._id}`);
}))

app.get('/vetplaces/:id', catchAsync(async (req, res) => {
   const { id } = req.params;
   const vetplace = await Vetplace.findById(id).populate('reviews');
   res.render('vetplaces/show', { vetplace });
}))

app.get('/vetplaces/:id/edit', catchAsync(async (req, res) => {
   const vetplace = await Vetplace.findById(req.params.id);
   res.render('vetplaces/edit', { vetplace })
}))

app.put('/vetplaces/:id/', validateVetPlaces, catchAsync(async (req, res) => {
   const updatedPlace = await Vetplace.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
   res.redirect(`/vetplaces/${updatedPlace._id}`)
}))

app.delete('/vetplaces/:id/', catchAsync(async (req, res) => {
   await Vetplace.findByIdAndDelete(req.params.id);
   res.redirect('/vetplaces')
}))

app.post('/vetplaces/:id/reviews', validateReview, catchAsync(async (req, res, next) => {
   console.log('REQ.BODY:', req.body);
   const vetId = await Vetplace.findById(req.params.id);
   const review = new Review(req.body.reviews);
   vetId.reviews.push(review);
   await review.save();
   await vetId.save();
   res.redirect(`/vetplaces/${vetId._id}`);
}))

app.delete('/vetplaces/:id/reviews/:reviewId', catchAsync(async (req, res, next) => {
   const { id, reviewId } = req.params;
   await Vetplace.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
   await Review.findByIdAndDelete(reviewId);
   res.redirect(`/vetplaces/${id}`);
}))

app.all(/(.*)/, (req, res, next) => { //for every path
   // res.send('404');
   next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
   const { status = 500 } = err;
   if (!err.message) {
      err.message = 'Something went wrong !'
   }
   res.status(status).render('error', { err });
   // res.send('Something went wrong!');
})

// app.get('/makevetplace', async (req, res) => {
//    const vetplace = new Vetplace({ name: "Pet Dream", location: "Timisoara" })
//    await vetplace.save();
//    res.send(vetplace);
// })

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});