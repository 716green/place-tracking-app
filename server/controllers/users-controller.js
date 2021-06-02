const HttpError = require('../models/http-error');

const { validationResult } = require('express-validator');
const User = require('../models/user');

// for express-validation package
const extractValidationErrorMsg = (err) => {
  const errorMsg = err.errors.map((a) => a)[0].msg;
  console.log(errorMsg);
  return errorMsg;
};

const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
  const { name, email, password, places } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = extractValidationErrorMsg(errors) || '';
    const err = new HttpError(
      `Invalid inputs passed, please check your data. ${errorMsg}.`,
      422
    );
    return next(err);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      `Signup failed. Please try again later. ${err}`,
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image:
      'https://static.wikia.nocookie.net/memepediadankmemes/images/9/90/192.png/revision/latest?cb=20200610055032',
    password,
    places,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(`Signup failed, please try again\n${err}`, 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      `Signup failed. Please try again later. ${err}`,
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credentials. Unable to login.', 401);
    return next(error);
  }
  res.status(200).json({ message: 'Logged In' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
