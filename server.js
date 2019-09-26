'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const movies = require('./movies.json');

const server = express();

server.use(morgan('dev'));
server.use(helmet());
server.use(cors());

server.use(function validateBearerToken (req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res
      .status(401)
      .json({ error: 'Unauthorized request' });
  }
  next();
});

server.get('/movie', function handleGetMovies (req, res) {
  //1. retrieve the parameter values from the query object
  const { genre = '', country = '', avg_vote = '' } = req.query;

  //2. validate the parameter values, never trust the client
  function validateString (input) {
    if (Number.isNaN(parseFloat(input))) {
      return res
        .status(400)
        .json({ error: 'Input must be a string'});
    }
  }

  //VALIDATE GENRES
  if (genre) {

    //checks if genre is not a number (i.e., is a string; assumes input will not be object)
    if (!(isNaN(parseFloat(genre)))) {
      return res
        .status(400)
        .json({ error: 'Genre input must be a string'});
    }
    //checks if genre is a valid string
    const validGenres = ['Animation', 'Drama', 'Comedy', 'Romantic', 'Drama', 'Crime', 'Horror', 'Documentary', 'Action', 'Thriller', 'Adventure', 'Fantasy', 'Musical', 'Biography', 'History', 'War', 'Grotesque', 'Western', 'Spy'];
    const lowercaseValidGenres = validGenres.map(genreName => genreName.toLowerCase());
    if (!lowercaseValidGenres.includes(genre.toLowerCase())) {
      return res
        .status(400)
        .json({ error: 'Genre must be one of the following: Animation, Drama, Comedy, Romantic, Drama, Crime, Horror, Documentary, Action, Thriller, Adventure, Fantasy, Musical, Biography, History, War, Grotesque, Western, Spy' });
    } 
  }

  //VALIDATE COUNTRY
  const validCountries = [];
  function makeValidCountriesArray () {
    for( let i = 0; i < movies.length; i++ ) {
      let moviesCountries = (movies[i].country.split(', '));
      moviesCountries.forEach(country => {
        if( !(validCountries.includes(country)) ) {
          validCountries.push(country);
        }
      });      
    }
    return validCountries;
  }
  makeValidCountriesArray();

  if (country) {
    //checks if genre is not a number (i.e., is a string; assumes input will not be object)
    if (!(isNaN(parseFloat(country)))) {
      return res
        .status(400)
        .json({ error: 'Country input must be a string'});
    }  

    //checks if genre is not a number (i.e., is a string; assumes input will not be object)
    if (!(validCountries.map(country => country.toLowerCase())).includes(country.toLowerCase())) {
      return res
        .status(400)
        .json({error: `Country should be one of the following:${validCountries.map(country =>  ` ${country}`)}`});
    }
  }

  //VALIDATE AVERAGE VOTE 
  if (avg_vote) {   
    if ( isNaN(avg_vote) || avg_vote <= 1 || avg_vote >= 10) {
      return res
        .status(400)
        .json({ error: 'Vote input must be a number between 1 and 10'});
    }
  }
 
  //4. if the values are valid, process the request.
  let results = movies;

  if (genre) {
    results = movies.filter(movie =>
      movie
        .genre.toLowerCase()
        .includes(genre.toLowerCase())
    );
  }

  if (country) {
    results = movies.filter(movie =>
      movie
        .country.toLowerCase()
        .includes(country.toLowerCase())
    );
  }

  if (avg_vote) {
    results = movies.filter(movie =>
      movie.avg_vote >= avg_vote
    );
  }

  //5. construct and 6. send a response
  res.send(results);
});

server.listen(8000, 
  console.log('Server is running at port 8000')
);