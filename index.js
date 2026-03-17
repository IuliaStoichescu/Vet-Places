if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config();
}

const express = require('express');
const app = express();
app.set('query parser', 'extended');
const path = require('path');
const PORT = process.env.PORT || 3000;
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
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');
const usersRoute = require('./routes/users.js');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const db_url = process.env.DB_URL;
// const helmet = require('helmet');

const { MongoStore } = require('connect-mongo');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'assets')));
app.use(sanitizeV5({ replaceWith: '_' }));
// app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: db_url,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.STORE_SECRET
    }
});

store.on("error",function(e){
   console.log("Store Error",e);
})

const sessionConfig = {
   store,
   name:'sess',
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      // secure:true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,//expire in a week
      maxAge: 1000 * 60 * 60 * 24 * 7
   }
}
app.use(session(sessionConfig))
app.use(flash());
// app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());//for persistent login sessions
passport.use(new localStrategy(User.authenticate()));

// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//     xDownloadOptions: false,
//   }),
// );

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// 'mongodb://127.0.0.1:27017/vetPlaces'
mongoose.connect(db_url)
   .then(() => {
      console.log("Succesfully Mongo connected to port 27017")
   })
   .catch(err => {
      console.log("Oh no !! Error: ", err);
   })

app.use((req, res, next) => {
   res.locals.currentUser = req.user;//set the current user to the one that is logged in
   res.locals.success = req.flash('success'); //have access 
   res.locals.error = req.flash('error');
   next();
})

app.get('/fakeUser', async (req, res) => {
   const user = new User({ email: 'iulist@gmail.com', username: 'iuli25' });
   const newUser = await User.register(user, 'mypassword');
})

app.use("/vetplaces", vetplacesRoute);
app.use("/vetplaces/:id/reviews", reviewsRoute);
app.use("/", usersRoute);

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