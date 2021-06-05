const HttpError = require('../models/http-error');
const User = require('../models/user');

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

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password,
    places: [],
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
  res.status(200).json({
    message: 'Logged In',
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
