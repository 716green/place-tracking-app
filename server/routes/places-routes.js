const express = require('express');
const router = express.Router();
const placesControllers = require('../controllers/places-controllers.js');
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');
const {
  getPlacesByUserId,
  getPlaceById,
  updatePlace,
  deletePlace,
  getAllPlaces,
} = placesControllers;

//* *************************
//* **** PLACES ROUTES ******
//* *************************

//* GET - PID
router.get('/:pid', getPlaceById);

//* GET - UID
router.get('/user/:uid', getPlacesByUserId);

// This middleware is only valid for the routes below it. The 2 above routes can interact with anybody
//* Verify incoming request's token
router.use(checkAuth);

//* POST
router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesControllers.createPlace
);

//* PATCH - PID
router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  updatePlace
);

//* DELETE - PID
router.delete('/:pid', deletePlace);

router.get('/', getAllPlaces);

module.exports = router;
