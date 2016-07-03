var app = angular.module('myApp', []);
app.factory('WeatherApi', function ($http) {
	var obj = {};

	obj.getLoc = function () {
		return $http.jsonp("http://ipinfo.io/json?callback=JSON_CALLBACK");
	};
	obj.getWeather = function (latitude, longitude) {
		var api = "http://api.openweathermap.org/data/2.5/weather?";
		var units = "&units=metric";
		var appid = '&appid=270245b93dc95a2783a7a4937a627994';
		var cb = "&callback=JSON_CALLBACK";

		return $http.jsonp(api + latitude + longitude + units + appid + cb);
	};

	return obj;
});

app.controller('MainCtrl', function ($scope, WeatherApi) {
	//GOOGLE API
	function initApi() {
		var options = {
			types: ['(cities)']
		};
		var input = document.getElementById('searchCityName');
		var autocomplete = new google.maps.places.Autocomplete(input, options);
		google.maps.event.addListener(autocomplete, 'place_changed', function () {
			var place = autocomplete.getPlace();
			WeatherApi.getLoc().success(function (data) {
				var lat = 'lat=' + place.geometry.location.lat(),
					lon = '&lon=' + place.geometry.location.lng();
				WeatherApi.getWeather(lat, lon).success(function (data) {
					$scope.city = data.name;
					var iconKey = data.weather[0].main;

					$scope.getIcon = function () {
						if (icons[iconKey]) {
							if (iconKey === 'Clear') {
								return icons[iconKey][dayOrNight()];
							}
							return icons[iconKey];
						}
					};

					cityWeather(data)
				});
			});

		});
	};
	google.maps.event.addDomListener(window, 'load', initApi);
	//****
	//****
	var helper = document.getElementById('searchCityName')
	helper.oninput = function () {
		document.getElementById('help').style.display = 'none';
	};
	//***
	var icons = {
		'Clear': {
			'day': "wi wi-day-sunny",
			'night': "wi wi-night-clear"
		},
		'Clouds': "wi wi-cloudy",
		'Snow': "wi wi-snow",
		'Rain': "wi wi-rain",
		'Drizzle': "wi wi-sprinkle",
		'Thunderstorm': "wi wi-thunderstorm"
	};

	$scope.unit = 'C';
	var isChanged = false;
	WeatherApi.getLoc().success(function (data) {

		var lat = 'lat=' + data.loc.split(',')[0],
			lon = '&lon=' + data.loc.split(',')[1];

		$scope.country = data.country;
		WeatherApi.getWeather(lat, lon).success(function (data) {
			$scope.city = data.name;
			var iconKey = data.weather[0].main;

			$scope.getIcon = function () {
				if (icons[iconKey]) {
					if (iconKey === 'Clear') {
						return icons[iconKey][dayOrNight()];
					}
					return icons[iconKey];
				}
			};

			cityWeather(data)
		});
	});

	function cityWeather(data) {
		$scope.temp = $scope.cel = Math.round(data.main.temp);
		$scope.fah = Math.round(($scope.temp * 9) / 5 + 32);
	}

	$scope.changeUnit = function () {
		if (isChanged) {
			$scope.unit = 'C';
			$scope.temp = $scope.cel;
			return isChanged = false;
		}
		$scope.unit = 'F';
		$scope.temp = $scope.fah;
		return isChanged = true;
	};

	function dayOrNight() {
		var hours = new Date().getHours();
		if (hours > 6 && hours < 20) {
			return 'day';
		}
		return 'night';
	}

});
