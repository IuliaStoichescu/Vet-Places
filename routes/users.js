const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const catchAsync = require('../utils/catchAsync.js');
const passport = require('passport');
const { storeReturnTo } = require('../logMiddleware');

router.get('/register', (req, res) => {
   res.render('auth/register');
})

router.post('/register', catchAsync(async (req, res) => {
   try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, err => {
         if (err) {
            return next(err);
         }
         req.flash('success', 'Welcome to Vet Hub!');
         res.redirect('/vetplaces');
      })
   } catch (e) {
      req.flash('error', e.message);
      res.redirect('register');
   }
}));

router.get('/login', (req, res) => {
   res.render('auth/login');
})

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
   req.flash('success', 'Welcome back!');
   const redirectUrl = res.locals.returnTo || '/vetplaces';
   res.redirect(redirectUrl);
})

router.get('/logout', (req, res, next) => {
   req.logOut(function (err) {
      if (err) {
         return next(err);
      }
      req.flash('success', 'Logged out succesfully!');
      res.redirect('/vetplaces');
   });
})

module.exports = router;