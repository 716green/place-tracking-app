const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users-controller');
// todo - remove express-validator
// const { check } = require('express-validator');

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
