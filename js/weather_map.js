"use strict"
const weatherMapKey = '22fc8c58226f0972201cc4163c067108';
$(document).ready(function () {
	$.get('https://api.openweathermap.org/data/2.5/onecall', {
		appid: weatherMapKey,
		lat: 29.4252,
		lon: -98.4861,
		units: 'imperial'
	})
		.done(function (weather) {
			console.log(weather)
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
					let precipitation = parseInt(dailyWx[i].pop * 100);
					let description = dailyWx[i].weather[0].description
					let highTemp = dailyWx[i].temp.max.toFixed(1)
					let lowTemp = dailyWx[i].temp.min.toFixed(1)
					let uvi = dailyWx[i].uvi.toFixed(2)
					let feelsLike = dailyWx[i].feels_like.day.toFixed(1)
					
					const {humidity, wind_speed, pressure, wind_deg} = dailyWx[i];
					
					// data for html
					cards += `
							<div class="card-deck card-deck-font pt-3 animate__animated animate__bounceInLeft">
								<div class="card bg-dark text-white mx-5" id="cards">
									<div class="card-header text-center">
										<h5>${dt}</h5>
									</div>
									<div class="card-body">
										<h3 class="card-title text-center">${description}</h3>
										<p class="card-text">
											<span class="cardText">High: </span> ${highTemp}&deg F <span class="cardText">Low: </span> ${lowTemp}&deg F
										</p>
										<p class="card-text">
											<span class="cardText">High Feels Like </span> ${feelsLike}&deg F
										</p>
										<p class="card-text">
										<span class="cardText">Humidity: </span> ${humidity}%
										</p>
										<p class="card-text">
											<span class="cardText">UV Index: </span> ${uvi}
										</p>
										<p class="card-text">
											<span class="cardText">Wind Speed: </span> ${wind_speed}m/s, ${wind_deg}&deg
										</p>
										<p class="card-text">
											<span class="cardText">Precipitation: </span> ${precipitation}%
										</p>
										<p class="card-text">
											<span class="cardText">Pressure: </span> ${pressure}mb
										</p>
										<p class="card-text">
											<span class="cardText">Sunrise: </span> ${sr}
										</p>
										<p class="card-text">
											<span class="cardText">Sunset: </span> ${ss}
										</p>
									</div>
								</div>
							</div>
					`
				}
				$('#city-header').html('<h2 class="text-center">' + 'San Antonio, Texas' + '</h2>')
				$('#forecastContainer').html(cards) // insert into html here
			}
			
			// Create Map
			mapboxgl.accessToken = mapBoxKey;
			var weatherMap = new mapboxgl.Map({
				container: 'map',
				zoom: 10,
				center: [-98.4861, 29.4252],
				style: 'mapbox://styles/mapbox/streets-v11'
			})
			
			// really cool code, pretty sure it's a lot of es6 involved. not going to take credit but it's cool to see. continuing to study for comprehension.
			weatherMap.on("load", () => {
				fetch("https://api.rainviewer.com/public/weather-maps.json")
					.then(res => res.json())
					.then(apiData => {
						apiData.radar.past.forEach(frame => {
							weatherMap.addLayer({
								id: `rainviewer_${frame.path}`,
								type: "raster",
								source: {
									type: "raster",
									tiles: [
										apiData.host + frame.path + '/256/{z}/{x}/{y}/2/1_1.png'
									],
									tileSize: 256
								},
								layout: {visibility: "none"},
								minzoom: 0,
								maxzoom: 12
							});
						});
						
						let i = 0;
						const interval = setInterval(() => {
							if (i > apiData.radar.past.length - 1) {
								clearInterval(interval);
							} else {
								apiData.radar.past.forEach((frame, index) => {
									weatherMap.setLayoutProperty(
										`rainviewer_${frame.path}`,
										"visibility",
										index === i || index === i - 1 ? "visible" : "none"
									);
								});
								if (i - 1 >= 0) {
									const frame = apiData.radar.past[i - 1];
									let opacity = 1;
									setTimeout(() => {
										const i2 = setInterval(() => {
											if (opacity <= 0) {
												return clearInterval(i2);
											}
											weatherMap.setPaintProperty(
												`rainviewer_${frame.path}`,
												"raster-opacity",
												opacity
											);
											opacity -= 0.1;
										}, 50);
									}, 400);
								}
								i += 1;
							}
						}, 2000);
					})
					.catch(console.error);
				
				// drag marker functionality & get new forecast
				var locationMarker = new mapboxgl.Marker({
					draggable: true,
					color: 'red'
				})
					.setLngLat([-98.4861, 29.4252])
					.addTo(weatherMap)
					.on('dragend', () => {
						var results = locationMarker.getLngLat()
						var coordArr = Object.values(results)
						
						$.get('https://api.openweathermap.org/data/2.5/onecall', {
							appid: weatherMapKey,
							lat: coordArr[1],
							lon: coordArr[0],
							units: 'imperial'
						})
							.done(function (weather) {
								reverseGeocode(results, mapBoxKey).then(function (result) {
									$('#city-header').html('<h2 class="text-center">' + result + '</h2>');
								})
								
								var dailyWx = weather.daily; // stored daily weather data in variable to iterate easier
								
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
										let precipitation = parseInt(dailyWx[i].pop * 100);
										let description = dailyWx[i].weather[0].description
										let highTemp = dailyWx[i].temp.max.toFixed(1)
										let lowTemp = dailyWx[i].temp.min.toFixed(1)
										let uvi = dailyWx[i].uvi.toFixed(2)
										let feelsLike = dailyWx[i].feels_like.day.toFixed(1)
										
										const {humidity, wind_speed, pressure, wind_deg} = dailyWx[i];
										
										// data for html
										cards += `
							<div class="card-deck card-deck-font pt-3 animate__animated animate__pulse">
								<div class="card bg-dark text-white mx-5" id="cards">
									<div class="card-header text-center">
										<h5>${dt}</h5>
									</div>
									<div class="card-body">
										<h3 class="card-title text-center">${description}</h3>
										<p class="card-text">
											<span class="cardText">High: </span> ${highTemp}&deg F <span class="cardText">Low: </span> ${lowTemp}&deg F
										</p>
										<p class="card-text">
											<span class="cardText">High Feels Like </span> ${feelsLike}&deg F
										</p>
										<p class="card-text">
										<span class="cardText">Humidity: </span> ${humidity}%
										</p>
										<p class="card-text">
											<span class="cardText">UV Index: </span> ${uvi}
										</p>
										<p class="card-text">
											<span class="cardText">Wind Speed: </span> ${wind_speed}m/s, ${wind_deg}&deg
										</p>
										<p class="card-text">
											<span class="cardText">Precipitation: </span> ${precipitation}%
										</p>
										<p class="card-text">
											<span class="cardText">Pressure: </span> ${pressure}mb
										</p>
										<p class="card-text">
											<span class="cardText">Sunrise: </span> ${sr}
										</p>
										<p class="card-text">
											<span class="cardText">Sunset: </span> ${ss}
										</p>
									</div>
								</div>
							</div>
					`
									}
									
									$('#forecastContainer').html(cards) // insert into html here
								}
							})
						// alert('you moved the marker')
					})
				
				// change map style
				const layerList = document.getElementById('menu');
				const inputs = layerList.getElementsByTagName('input');
				for (const input of inputs) {
					input.onclick = (layer) => {
						const layerId = layer.target.id;
						weatherMap.setStyle('mapbox://styles/mapbox/' + layerId);
					};
				}
				
				
				$('#current-weather').click(function (event) { // using a click event to get a lat/long from user input for 5-day forecast
					event.preventDefault();
					geocode($('#location-search').val(), mapBoxKey).then(function (results) { // used geocode function to convert user input to lat/long coordinates
						// console.log(results)
						
						weatherMap.flyTo({
							center: results,
							essential: true,
							speed: 0.5,
							zoom: 9,
							bearing: 0
						})
						
						
						// get weather data from search
						$.get('https://api.openweathermap.org/data/2.5/onecall', {
							appid: weatherMapKey,
							lat: results[1], // came from geocode function & user input
							lon: results[0], // came from geocode function & user input
							units: 'imperial'
						})
							.done(function (weather) {
								// console.log(weather)
								var dailyWx = weather.daily; // stored daily weather data in variable to iterate easier
								// console.log(dailyWx);
								var userLocation = $('#location-search').val();
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
										let precipitation = parseInt(dailyWx[i].pop * 100);
										let description = dailyWx[i].weather[0].description
										let highTemp = dailyWx[i].temp.max.toFixed(1)
										let lowTemp = dailyWx[i].temp.min.toFixed(1)
										let uvi = dailyWx[i].uvi.toFixed(2)
										let feelsLike = dailyWx[i].feels_like.day.toFixed(1)
										
										const {humidity, wind_speed, pressure, wind_deg} = dailyWx[i];
										
										// data for html
										cards += `
							<div class="card-deck card-deck-font pt-3 animate__animated animate__bounceInLeft">
								<div class="card bg-dark text-white mx-5" id="cards">
									<div class="card-header text-center">
										<h5>${dt}</h5>
									</div>
									<div class="card-body">
										<h3 class="card-title text-center">${description}</h3>
										<p class="card-text">
											<span class="cardText">High: </span> ${highTemp}&deg F <span class="cardText">Low: </span> ${lowTemp}&deg F
										</p>
										<p class="card-text">
											<span class="cardText">High Feels Like </span> ${feelsLike}&deg F
										</p>
										<p class="card-text">
										<span class="cardText">Humidity: </span> ${humidity}%
										</p>
										<p class="card-text">
											<span class="cardText">UV Index: </span> ${uvi}
										</p>
										<p class="card-text">
											<span class="cardText">Wind Speed: </span> ${wind_speed}m/s, ${wind_deg}&deg
										</p>
										<p class="card-text">
											<span class="cardText">Precipitation: </span> ${precipitation}%
										</p>
										<p class="card-text">
											<span class="cardText">Pressure: </span> ${pressure}mb
										</p>
										<p class="card-text">
											<span class="cardText">Sunrise: </span> ${sr}
										</p>
										<p class="card-text">
											<span class="cardText">Sunset: </span> ${ss}
										</p>
									</div>
								</div>
							</div>
					`
									}
									$('#city-header').html('<h2 class="text-center">' + userLocation + '</h2>');
									$('#forecastContainer').html(cards) // insert into html here
									
									
								}
							})
					})
				})
				$('#refresh').click(function (event) {
					event.preventDefault();
					window.location.reload();
				})
			})
		})
})