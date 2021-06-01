const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const getGeocode = require('../util/location');
const xyLocation = require('../util/location');

// const axios = require('axios');

// const API_KEY =
//   'AAPKcf12969575f64de7b5009c06553bd7970WIi7BKakY-D6gPDSTXoRRHWP9rlUkkLfUr4P0SN3K30apOX0awFBPZwYnZF21uC';

// let location = {
//   lat: 0,
//   lng: 0,
// };

// const getGeocode = async (address, location) => {
//   let [lat, lng] = '';
//   const baseUrl =
//     'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer';
//   const url = `${baseUrl}/findAddressCandidates?address=${address}&f=json&token=${API_KEY}`;
//   location = await axios.get(url).then(async (response) => {
//     const { x, y } = await response.data.candidates[0].location;
//     location.lat = y;
//     location.lng = x;

//     const cb = () => {
//       return location;
//     };

//     return await cb();
//   });
//   console.log(location);
//   console.log(location.lat);
//   console.log(location.lng);
// };

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

  let coords;
  try {
    getLatLng().then((result) => {
      coords = result;
    });
  } catch (error) {
    return next(error);
  }
  setTimeout(() => {
    const createdPlace = {
      id: uuid(),
      title,
      description,
      location: coords,
      address,
      creator,
    };
    DUMMY_PLACES.push(createdPlace);
    res.status(201).json({ place: createdPlace });
  }, 300);
  // 201 - Success adding new item
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
