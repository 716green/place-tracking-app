const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const getGeocode = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world.',
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1',
  },
  {
    id: 'p2',
    title: 'Mount Rushmore',
    description: 'One of the most famous sky scrapers in the world.',
    location: {
      lat: 40.1234,
      lng: -100.4325,
    },
    address: '1 Rushmore Pk, Rushmore, SC 12345',
    creator: 'u1',
  },
];

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;
  DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError('Could not find a place for that id.', 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => {
    p.id !== placeId;
  });
  res.status(200).json({ message: 'Deleted Place.' });
};

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place) {
    throw new HttpError('Could not find a place with that provided id.', 404);
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });
  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a place for the provided id.', 404)
    );
  }
  res.json({ places });
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
