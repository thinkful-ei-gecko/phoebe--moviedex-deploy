const express = require('express');
const morgan = require('morgan');
const movies = require('./movies.json');

const server = express();

server.use(morgan('dev'));

server.use('/movie', (req, res) => {
    const { genre = '', country = '', avg_vote = '' } = req.query;

    const validGenres = ['Animation', 'Drama', 'Comedy', 'Romantic', 'Drama', 'Crime', 'Horror', 'Documentary', 'Action', 'Thriller', 'Adventure', 'Fantasy', 'Musical', 'Biography', 'History', 'War', 'Grotesque', 'Western', 'Spy']

    function handleGetTypes(req, res) {
        res.json(validGenres)
    }

    let results = movies;

    if (genre) {
        results = movies.filter(movie =>
          movie
            .genre.toLowerCase()
            .includes(genre.toLowerCase())
        );
    res.send(results)
    }

    if (country) {
        results = movies.filter(movie =>
          movie
            .country.toLowerCase()
            .includes(country.toLowerCase())
        );
    res.send(results)
    }

    if (avg_vote) {
        const avg_voteNum = Number(avg_vote);
        results = movies.filter(movie =>
          movie.avg_vote >= avg_voteNum
        );
    res.send(results)
    }

})



server.listen(8000, 
    console.log('Server is running at port 8000')
);