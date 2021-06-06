const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

// Middleware for express app
module.exports = (req, res, next) => {
  // Browser will try to revert POST to OPTIONS
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Authorization: 'Bearer TOKEN' // split(' ')[1] => TOKEN
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed!');
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_ID_KEY);
    // Pull userId out of token because we added it in when creating
    const { userId } = decodedToken;
    req.userData = userId;
    // Allow request to continue it's journey
    next();
  } catch (err) {
    const error = new HttpError('Unable to verify user authentication', 401);
    return next(error);
  }
};
