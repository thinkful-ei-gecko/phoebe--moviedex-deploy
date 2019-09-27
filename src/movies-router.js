const express = require("express");
const logger = require("./logger");
const movies = require("./movies.json");
const validURL = require("valid-url");

const moviesRouter = express.Router();

moviesRouter.route("/movies").get((req, res) => {
	//1. retrieve the parameter values from the query object
	const { genre = "", country = "", avg_vote = "" } = req.query;

	//2. validate the parameter values, never trust the client
	//VALIDATE GENRES
	if (genre) {
		//checks if genre is not a number (i.e., is a string; assumes input will not be object)
		if (!isNaN(parseFloat(genre))) {
			logger.error("Genre input must be a string");
			return res.status(400).send("Invalid input");
		}
		//checks if genre is a valid string
		const validGenres = [
			"Animation",
			"Drama",
			"Comedy",
			"Romantic",
			"Drama",
			"Crime",
			"Horror",
			"Documentary",
			"Action",
			"Thriller",
			"Adventure",
			"Fantasy",
			"Musical",
			"Biography",
			"History",
			"War",
			"Grotesque",
			"Western",
			"Spy"
		];
		const lowercaseValidGenres = validGenres.map(genreName =>
			genreName.toLowerCase()
		);
		if (!lowercaseValidGenres.includes(genre.toLowerCase())) {
			logger.error(
				"Genre must be one of the following: Animation, Drama, Comedy, Romantic, Drama, Crime, Horror, Documentary, Action, Thriller, Adventure, Fantasy, Musical, Biography, History, War, Grotesque, Western, Spy"
			);
			return res.status(400).send("Invalid input");
		}
	}

	//VALIDATE COUNTRY
	const validCountries = [];
	function makeValidCountriesArray() {
		for (let i = 0; i < movies.length; i++) {
			let moviesCountries = movies[i].country.split(", ");
			moviesCountries.forEach(country => {
				if (!validCountries.includes(country)) {
					validCountries.push(country);
				}
			});
		}
		return validCountries;
	}
	makeValidCountriesArray();

	if (country) {
		//checks if genre is not a number (i.e., is a string; assumes input will not be object)
		if (!isNaN(parseFloat(country))) {
			logger.error("Country input must be a string");
			return res.status(400).send("Invalid input");
		}

		//checks if genre is not a number (i.e., is a string; assumes input will not be object)
		if (
			!validCountries
				.map(country => country.toLowerCase())
				.includes(country.toLowerCase())
		) {
			logger.error(
				`Country should be one of the following:${validCountries.map(
					country => ` ${country}`
				)}`
			);
			return res.status(400).send("Invalid input");
		}
	}

	//VALIDATE AVERAGE VOTE
	if (avg_vote) {
		if (isNaN(avg_vote) || avg_vote <= 1 || avg_vote >= 10) {
			logger.error("Vote input must be a number between 1 and 10");
			return res.status(400).send("Invalid input");
		}
	}

	//4. if the values are valid, process the request.
	let results = movies;

	if (genre) {
		results = results.filter(movie =>
			movie.genre.toLowerCase().includes(genre.toLowerCase())
		);
	}

	if (country) {
		results = results.filter(movie =>
			movie.country.toLowerCase().includes(country.toLowerCase())
		);
	}

	if (avg_vote) {
		results = results.filter(movie => movie.avg_vote >= avg_vote);
	}

	//5. construct and 6. send a response
	res.send(results);
});

module.exports = moviesRouter;