const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const port = 5000;
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');
require('dotenv/config');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//* Define a static folder (images)
app.use('/api/uploads/images', express.static(path.join('uploads', 'images')));

// *****************************************
// * CORS - Express Server to React Client *
// *****************************************
// The Authorization header in the second setHeader() is being used because this app is handling authentication with MongoDB
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.error(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occured' });
});

mongoose
  .connect(process.env.MDB_CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => console.log(`Listening on port ${port}`));
  })
  .catch((err) => {
    console.error(err);
  });

// module.exports = { baseURL };
