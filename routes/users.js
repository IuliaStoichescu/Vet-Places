const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const catchAsync = require('../utils/catchAsync.js');
const passport = require('passport');
const { storeReturnTo } = require('../logMiddleware');
const users = require('../controllers/users.js');

router.get('/register', users.renderUser)

router.post('/register', catchAsync(users.registerUser));

router.get('/login', users.renderLogin)

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router;