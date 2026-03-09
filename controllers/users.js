const User = require('../models/user.js');

module.exports.renderUser = (req, res) => {
   res.render('auth/register');
}

module.exports.registerUser = async (req, res) => {
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
}

module.exports.renderLogin = (req, res) => {
   res.render('auth/login');
}

module.exports.login = (req, res) => {
   req.flash('success', 'Welcome back!');
   const redirectUrl = res.locals.returnTo || '/vetplaces';
   res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
   req.logOut(function (err) {
      if (err) {
         return next(err);
      }
      req.flash('success', 'Logged out succesfully!');
      res.redirect('/vetplaces');
   });
}