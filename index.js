const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
// const catchAsync = require('./utils/catchAsync');
var morgan = require('morgan');
const ejsMate = require('ejs-mate');
const { joiSchema, reviewSchema } = require('./validatingSchemas.js')
const Review = require('./models/review')
const vetplacesRoute = require('./routes/vetplaces')
const reviewsRoute = require('./routes/reviews')
const session = require('express-session');
const flash = require('connect-flash');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
   secret: 'mysecret',
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,//expire in a week
      maxAge: 1000 * 60 * 60 * 24 * 7
   }
}
app.use(session(sessionConfig))
app.use(flash());

mongoose.connect('mongodb://127.0.0.1:27017/vetPlaces')
   .then(() => {
      console.log("Succesfully Mongo connected to port 27017")
   })
   .catch(err => {
      console.log("Oh no !! Error: ", err);
   })

app.use((req, res, next) => {
   res.locals.success = req.flash('success'); //have access 
   res.locals.error = req.flash('error');
   next();
})

app.use("/vetplaces", vetplacesRoute);
app.use("/vetplaces/:id/reviews", reviewsRoute);

app.get('/', (req, res) => {
   res.render('home');
})


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