const express = require('express');

const router = express.Router();

const placesControllers = require('../controllers/places-controllers.js');

//* *************************
//* **** PLACES ROUTES ******
//* *************************

//* GET - UID
router.get('/user/:uid', placesControllers.getPlacesByUserId);

//* GET - PID
router.get('/:pid', placesControllers.getPlaceById);

//* POST
router.post('/', placesControllers.createPlace);

//* PATCH - PID
router.patch('/:pid', placesControllers.updatePlaceById);

//* DELETE - PID
router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
