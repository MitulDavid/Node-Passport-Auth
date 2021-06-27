const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User Model
const User = require('../models/User');

//@route   GET /login
router.get('/login', (req, res) => res.render('login'));

//@route   GET /register
router.get('/register', (req, res) => res.render('register'));

//@route   POST /register
//@desc    Validate form > check if user already exists > hash password > store user
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check for required fields
  if (!email || !name || !password || !password2) {
    errors.push({
      msg: 'Please fill in all fields',
    });
  }

  //check that passwords match
  if (password !== password2) {
    errors.push({
      msg: 'Passwords do not match',
    });
  }

  //check password length
  if (password.length < 6) {
    errors.push({
      msg: 'The password should be at least 6 characters',
    });
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
    });
  } 

  //validation passed
  else {
    User.findOne({
      email: email,
    }).then((user) => {

      //Check if user exists
      if (user) {
        errors.push({
          msg: 'User already registered',
        });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          password2,
        });

        //Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) console.log(err);
            newUser.password = hash;
            
            //Save User
            newUser
              .save()
              .then((user) => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

//@route   POST /login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

//@route   GET /logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have been logged out');
  res.redirect('/users/login');
});

module.exports = router;
