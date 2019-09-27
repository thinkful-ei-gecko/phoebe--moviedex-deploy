'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const moviesRouter = require('./movies-router');

const app = express();
const morganSetting = NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

//Authentication validating middleware
app.use(function validateBearerToken (req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res
      .status(401)
      .json({ error: 'Unauthorized request' });
  }
  next();
});

app.use(moviesRouter);

//Error handling middleware
app.use((error, req, res, next) => {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    reponse = { error }
  }
  res.status(500).json(response)
})

module.exports = app;