const express = require('express');

const router = express.Router();

const usersController = require('../controllers/users-controller');

// const HttpError = require('../models/http-error');

//? *************************
//? ***** USER ROUTES *******
//? *************************

//* GET
router.get('/', usersController.getUsers);

//* POST - SIGNUP
router.post('/signup', usersController.signup);

//* POST
router.post('/login', usersController.login);

module.exports = router;
