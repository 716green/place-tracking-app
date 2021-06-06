const HttpError = require('../models/http-error');
const User = require('../models/user');

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = async (req, res, next) => {
  let users;
  try {
    //* Return user objects without the password field
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      `Fetching users failed, please try again later. ${err}`,
      500
    );
    return next(error);
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const validationResult = (name, email, password) => {
  let errors = email.includes('@') ? '' : 'Error - Email: no @ symbol\n';
  errors += !!name ? '' : 'Error - Missing Name\n';
  errors += name.length >= 3 ? '' : 'Error - Missing Name\n';
  errors += !!password.length ? '' : 'Error - Password too short \n';
  errors += password.length >= 6 ? '' : 'Error - Password too short \n';
  if (!errors || errors.length < 1) {
    return null;
  } else {
    return errors;
  }
};

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  let errors = validationResult(name, email, password);
  if (!!errors) {
    console.error({ errors });
    const err = new HttpError(
      `Invalid inputs passed, please check your data. ${errors}.`,
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

  let hashedPassword;
  // password variable is plaintext which is safe with HTTPS
  const saltRoundCount = 12;
  // 12 is a good number of salt rounds to be safe and fast
  // returns promise
  try {
    hashedPassword = await bcrypt.hash(password, saltRoundCount);
  } catch (err) {
    // HttpError is a modification made to the default Error class to create a custom class
    // with error codes and messages.
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );
    // next refers to ... async (req, res, next)
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(`Signup failed, please try again\n${err}`, 500);
    return next(error);
  }

  let token;
  // jwt sign method returns the token string
  const dataToEncode = {
    userId: createdUser.id,
    email: createdUser.email,
  };

  const privateJwtServerKey = process.env.SECRET_ID_KEY;

  const tokenOptions = {
    expiresIn: '1h',
  };

  try {
    token = jwt.sign(dataToEncode, privateJwtServerKey, tokenOptions);
  } catch (err) {
    const error = new HttpError(
      `Signup failed. Please try again later. ${err}`,
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ user: createdUser.id, email: createdUser.email, token: token });
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

  // Before bcryptjs
  // if (!existingUser || existingUser.password !== password) {
  if (!existingUser) {
    const error = new HttpError('Invalid credentials. Unable to login.', 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  // Look to the signup method to see a more clean implimentation of this code.
  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
      },
      process.env.SECRET_ID_KEY,
      {
        expiresIn: '1h',
      }
    );
  } catch (err) {
    const error = new HttpError(
      `Login failed. Please try again later. ${err}`,
      500
    );
    return next(error);
  }

  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
