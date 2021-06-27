const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

//@route   GET /
router.get('/', (req, res) => res.render('welcome'));

//@route   GET /dashboard
//@access  Authenticated
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    name: req.user.name,
  })
);

module.exports = router;
