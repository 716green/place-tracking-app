const HttpError = require('../models/http-error');
// todo - remove uuid package
// const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const getGeocode = require('../util/location');
const Place = require('../models/place');

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not update places. ${err}`,
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not update place. ${err}`,
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong. Could not delete place. ${err}`,
      500
    );
    return next(error);
  }

  try {
    await place.remove();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong. Could not delete place. ${err}`,
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted Place.' });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = HttpError(`Unable to find the provided id. ${err}`, 500);
    return next(error);
  }
  if (!place) {
    const error = HttpError(
      'Could not find a place with that provided id.',
      404
    );
    return next(error);
  }
  // using {getters: true} will transpose '_id' to 'id'
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(`Error interacting with database. ${err}`, 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError(`No results with user id ${userId}. ${err}`, 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description, address, creator } = req.body;

  const getLatLng = async () => {
    let latLng = await getGeocode(address);
    return latLng;
  };

  let coordinates;
  try {
    getLatLng().then((result) => {
      coordinates = result;
    });
  } catch (err) {
    const error = new HttpError(
      `Coordinate search failed, please try again\n${err}`,
      500
    );
    return next(error);
  }
  //? 3ms timeout required to allow coordinates to generate
  setTimeout(async () => {
    const createdPlace = new Place({
      title,
      description,
      address,
      location: coordinates,
      // todo - This is a placeholder image
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Empire_State_Building_in_Rainbow_Colors_for_Gay_Pride_2015_%2819258537982%29.jpg/2560px-Empire_State_Building_in_Rainbow_Colors_for_Gay_Pride_2015_%2819258537982%29.jpg',
      creator,
    });
    try {
      await createdPlace.save();
    } catch (err) {
      const error = new HttpError(
        `Creating place filed, please try again\n${err}`,
        500
      );
      return next(error);
    }
    //* 201 - Success adding new item
    res.status(201).json({ place: createdPlace });
  }, 300);
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
