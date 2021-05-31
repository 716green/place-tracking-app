const express = require('express');
const router = express.Router();
const placesControllers = require('../controllers/places-controllers.js');
const { check } = require('express-validator');

//* *************************
//* **** PLACES ROUTES ******
//* *************************

//* GET - UID
router.get('/user/:uid', placesControllers.getPlacesByUserId);

//* GET - PID
router.get('/:pid', placesControllers.getPlaceById);

//* POST
router.post(
  '/',
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
  placesControllers.updatePlace
);

//* DELETE - PID
router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
