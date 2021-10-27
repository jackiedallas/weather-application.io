"use strict";

/***
 * geocode is a method to search for coordinates based on a physical address and return
 * @param {string} search is the address to search for the geocoded coordinates
 * @param {string} token is your API token for MapBox
 * @returns {Promise} a promise containing the latitude and longitude as a two element array
 *
 * EXAMPLE:
 *
 *  geocode("San Antonio", API_TOKEN_HERE).then(function(results) {
 *      // do something with results
 *  })
 *
 */
function geocode(search, token) {
	var baseUrl = 'https://api.mapbox.com';
	var endPoint = '/geocoding/v5/mapbox.places/';
	return fetch(baseUrl + endPoint + encodeURIComponent(search) + '.json' + "?" + 'access_token=' + token)
		.then(function(res) {
			return res.json();
			// to get all the data from the request, comment out the following three lines...
		}).then(function(data) {
			return data.features[0].center;
		});
}


/***
 * reverseGeocode is a method to search for a physical address based on inputted coordinates
 * @param {object} coordinates is an object with properties "lat" and "lng" for latitude and longitude
 * @param {string} token is your API token for MapBox
 * @returns {Promise} a promise containing the string of the closest matching location to the coordinates provided
 *
 * EXAMPLE:
 *
 *  reverseGeocode({lat: 32.77, lng: -96.79}, API_TOKEN_HERE).then(function(results) {
 *      // do something with results
 *  })
 *
 */
function reverseGeocode(coordinates, token) {
	var baseUrl = 'https://api.mapbox.com';
	var endPoint = '/geocoding/v5/mapbox.places/';
	return fetch(baseUrl + endPoint + coordinates.lng + "," + coordinates.lat + '.json' + "?" + 'access_token=' + token)
		.then(function (res) {
			return res.json();
		})
		// to get all the data from the request, comment out the following three lines...
		.then(function (data) {
			return data.features[0].place_name;
		});
}
//
// function reverseGeocode(coordinates, token) {
// 	var baseUrl = 'https://api.mapbox.com';
// 	var endPoint = '/geocoding/v5/mapbox.places/';
// 	return fetch(baseUrl + endPoint + coordinates.lng + "," + coordinates.lat + '.json' + "?" + 'access_token=' + token)
// 		.then(function(res) {
// 			return res.json();
// 		})
// 		// to get all the data from the request, comment out the following three lines...
// 		.then(function(data) {
// 			return data.features[0].place_name;
// 		});
// }

function renderCards(weather) {
	var dailyWx = weather.daily;
	
	var cards = '';
	for (let i = 0; i < dailyWx.length; i++) {
		if (i <= 4) {
			// variable declarations for dates and times
			let dt = new Date(dailyWx[i].dt * 1000).toLocaleDateString('en-US', {
				weekday: 'short',
				day: 'numeric',
				year: 'numeric',
				month: 'long'
			});
			let sr = new Date(dailyWx[i].sunrise * 1000).toLocaleTimeString();
			let ss = new Date(dailyWx[i].sunset * 1000).toLocaleTimeString();
			let precipitation = dailyWx[i].pop * 100;
			
			
			// data for html
			cards += '<div class="card-deck card-deck-font pt-3">' +
				'<div class="card mx-5" id="cards">' +
				'<div class="card-header text-center">' + '<h5>' + dt + '</h5>' + '</div>' +
				'<div class="card-body">' +
				'<h3 class="card-title text-center">' + dailyWx[i].weather[0].description + '</h3>' +
				'<p class="card-text">' + '<span class="cardText">' + 'High: ' + '</span>' + dailyWx[i].temp.max.toFixed(1) + '&deg' + 'F' + '<span class="cardText">' + ' Low: ' + '</span>' + dailyWx[i].temp.min.toFixed(1) + '&deg' + 'F' + '</p>' +
				'<p class="card-text">' + '<span class="">' + 'High Feels Like  ' + '</span>' + dailyWx[i].feels_like.day.toFixed(1) + '&deg' + 'F' + '</p>' +
				'<p class="card-text">' + '<span class="cardText">' + 'Humidity: ' + '</span>' + dailyWx[i].humidity + '%' + '</p>' +
				'<p class="card-text">' + '<span class="cardText">' + 'UV Index: ' + '</span>' + dailyWx[i].uvi.toFixed(2) + '</p>' +
				'<p class="card-text">' + '<span class="cardText">' + 'Wind Speed: ' + '</span>' + dailyWx[i].wind_speed + 'm/s, ' + dailyWx[i].wind_deg + '&deg' + '</p>' +
				'<p class="card-text">' + '<span class="cardText">' + 'Precipitation: ' + '</span>' + parseInt(precipitation) + '%' + '</p>' +
				'<p class="card-text">' + '<span class="cardText">' + 'Pressure: ' + '</span>' + dailyWx[i].pressure + 'mb' + '</p>' +
				'<p class="card-text">' + '<span class="cardText">' + 'Sunrise: ' + '</span>' + sr + '</p>' +
				'<p class="card-text">' + '<span class="cardText">' + 'Sunset: ' + '</span>' + ss + '</p>' +
				'</div>' +
				'</div>' +
				'</div>'
		}
	}
	return cards;
}