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
      .json({ error: 'Unauthorized request' })
  }
  next();
});

server.get('/movie', function handleGetMovies (req, res) {
  //1. retrieve the parameter values from the query object
  const { genre = '', country = '', avg_vote = '' } = req.query;

  //2. validate the parameter values, never trust the client
  
  function getCountries( movies ) {
    const countries = [];
    
    for( let i = 0; i < movies.length; i++ ) {
        if( !countries.includes(movies[i].country) ) {
            countries.push( movies[i].country );
        }
    }
    
    return countries;
}

  function validateString (input) {
    if (typeof input !== 'string') {
      return res
        .status(400)
        .json({ error: 'Input must be a string'});
    }
  }

  //VALIDATE GENRES
  validateString(genre); //checks if genre is a string
  const validCountries = getCountries( movies ); 
  const validGenres = ['Animation', 'Drama', 'Comedy', 'Romantic', 'Drama', 'Crime', 'Horror', 'Documentary', 'Action', 'Thriller', 'Adventure', 'Fantasy', 'Musical', 'Biography', 'History', 'War', 'Grotesque', 'Western', 'Spy'];
  const lowercaseValidGenres = validGenres.map(genreName => genreName.toLowerCase());
  if (!lowercaseValidGenres.includes(genre.toLowerCase())) {
    return res
      .status(400)
      .json({ error: 'Genre must be one of the following: Animation, Drama, Comedy, Romantic, Drama, Crime, Horror, Documentary, Action, Thriller, Adventure, Fantasy, Musical, Biography, History, War, Grotesque, Western, Spy' });
  } //checks if genre is a valid string

  //VALIDATE COUNTRY is a string
  validateString(country);

  //VALIDATE AVERAGE VOTE is a number
  const avgVoteNum = Number(avg_vote);
  function validateNumber (input) {
    if (typeof input !== 'number') {
      return res
        .status(400)
        .json({ error: 'Input must be a number'});
    }
  }
  validateNumber(avgVoteNum);
 
  //4. if the values are valid, process the request.
  let results = movies;

  if (genre) {
    if (!validGenres.includes(genre)) {
        return res.status(400).json({error: `Genres should be one of ${JSON.stringify(validGenres)}`})
    }
    results = movies.filter(movie =>
      movie
        .genre.toLowerCase()
        .includes(genre.toLowerCase())
    );
  }

  if (country) {
    if (!validCountries.includes(country)) {
        return res.status(400).json({error: `Country should be on of {these}`})
    }
    results = movies.filter(movie =>
      movie
        .country.toLowerCase()
        .includes(country.toLowerCase())
    );
  }

  if (avgVoteNum) {
      if(avgVoteNum === NaN || avgVoteNum < 1 || avgVoteNum > 10){
          return res.status(400).json({error: `Vote must be between 1 and 10`})
      }
    results = movies.filter(movie =>
      movie.avg_vote >= avgVoteNum
    );
    // res.send(results)
  }

  //5. construct and 6. send a response
  res.send(results);
});

server.listen(8000, 
  console.log('Server is running at port 8000')
);