const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

//? *************************
//? ***** USER ROUTES *******
//? *************************

//* GET
router.get('/', usersController.getUsers);

//* POST - SIGNUP
router.post('/signup', fileUpload.single('image'), usersController.signup);

//* POST
router.post('/login', usersController.login);

module.exports = router;
