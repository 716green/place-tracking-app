const HttpError = require('../models/http-error');
const fs = require('fs');
const { validationResult } = require('express-validator');
const getGeocode = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

const getAllPlaces = async (req, res, next) => {
  let places;
  try {
    places = await Place.find({});
  } catch (err) {
    const error = new HttpError(`Unable to get all places. ${err}.`, 500);
    return next(error);
  }
  res.status(200).json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

//* UPDATE PLACE
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = HttpError(
      `Invalid inputs passed, please check your data. ${errors}`,
      422
    );
    return next(err);
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

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You can not modify this entry.', 401);
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
    //* ... .populate() searches other collections - extracts full user object in this instance
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      `Something went wrong. Could not delete place. ${err}`,
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You can not modify this entry which belongs to a different user.',
      401
    );
    return next(error);
  }

  const imagePath = place.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong. Could not delete place. ${err}`,
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.error(err);
  });

  res.status(200).json({ message: 'Deleted Place.' });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    //* .populate('collectionName') lets mongoose access that collection
    place = await Place.findById(placeId).populate('creator');
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
    places = await Place.find({ creator: userId }); // // Without .populate()
  } catch (err) {
    const error = new HttpError(`Error interacting with database. ${err}`, 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    console.error({ userId });
    return next(new HttpError('No results for this user.', 404));
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new HttpError(
      `Invalid inputs passed, please check your data. ${errors}`,
      422
    );
    return next(err);
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
      `Coordinate search failed, please try again. ${err}.`,
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
      image: req.file.path,
      creator,
    });

    let user;
    try {
      user = await User.findById(creator);
    } catch (err) {
      const error = new HttpError(
        `Creating place failed, please try again. ${err}.`,
        500
      );
      return next(error);
    }

    if (!user) {
      const error = new HttpError(
        `Could not find user for the provided id. [${user}]`,
        404
      );
      return next(error);
    }

    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      await createdPlace.save({ session: session });
      //* mongoose push, not array push
      user.places.push(createdPlace);
      await user.save({ session: session });
      await session.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        `Creating place failed, please try again. ${err}.`,
        500
      );
      return next(error);
    }
    //* 201 - Success adding new item
    res.status(201).json({ place: createdPlace });
  }, 300);
};

exports.getAllPlaces = getAllPlaces;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
