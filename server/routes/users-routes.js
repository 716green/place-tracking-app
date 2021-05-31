const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users-controller');
const { check } = require('express-validator');

// const HttpError = require('../models/http-error');

//? *************************
//? ***** USER ROUTES *******
//? *************************

//* GET
router.get('/', usersController.getUsers);

//* POST - SIGNUP
router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersController.signup
);

//* POST
router.post('/login', usersController.login);

module.exports = router;
