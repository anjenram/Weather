(function () {
    var app = angular
        .module('myApp', [])
        .factory('WeatherApi', WeatherApi)
        .controller('MainCtrl', MainCtrl);

    function WeatherApi($http) {
        var weatherApiUrl = "http://api.openweathermap.org/data/2.5/weather";
        var obj = {};

        obj.getLoc = function () {
            return $http.jsonp("http://ipinfo.io/json?callback=JSON_CALLBACK");
        };
        obj.getWeather = function (latitude, longitude, degreeType) {
            var requestConfig = {
                params: {
                    lat: latitude,
                    lon: longitude,
                    appid: '270245b93dc95a2783a7a4937a627994',
                    callback: "JSON_CALLBACK"
                }
            };

            if (degreeType && degreeType === degreeSystem.cel) {
                requestConfig.params.units = 'metric';
            };

            return $http.jsonp(weatherApiUrl, requestConfig);
        };
        return obj;
    }

    function MainCtrl($scope, WeatherApi) {
        var currentGooglePlace = {},
            currentLocation = {},
            currentDegreeSystem = degreeSystem.cel;

        $scope.weatherIcon = "";
        $scope.city = "";
        $scope.country = "";
        $scope.currentDegreeSystem = 'C';
        $scope.changeUnit = changeUnit;

        google.maps.event.addDomListener(window, 'load', initApi);
        WeatherApi.getLoc().success(function (data) {
            var splitted = data.loc.split(',');
            currentLocation.lat = splitted[0];
            currentLocation.lon = splitted[1];
            $scope.country = data.country;
            WeatherApi.getWeather(currentLocation.lat, currentLocation.lon, $scope.currentDegreeSystem).success(onWeatherReceived);
        });

        //GOOGLE API
        function initApi() {
            var options = {
                types: ['(cities)']
            };
            var input = document.getElementById('searchCityName');
            var autocomplete = new google.maps.places.Autocomplete(input, options);
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                currentGooglePlace = autocomplete.getPlace();
                currentLocation.lat = currentGooglePlace.geometry.location.lat();
                currentLocation.lon = currentGooglePlace.geometry.location.lng();
                WeatherApi.getWeather(currentLocation.lat, currentLocation.lon, $scope.currentDegreeSystem).success(onWeatherReceived);
            });
        };

        function onWeatherReceived(data) {
            var iconKey = data.weather[0].main;
            $scope.city = data.name;
            $scope.country = data.sys.country;
            $scope.temp = Math.round(data.main.temp);
            $scope.weatherIcon = getIcon(iconKey);
        };

        function changeUnit() {
            $scope.currentDegreeSystem = $scope.currentDegreeSystem === degreeSystem.cel ? degreeSystem.fah : degreeSystem.cel;
            WeatherApi.getWeather(currentLocation.lat, currentLocation.lon, $scope.currentDegreeSystem).success(onWeatherReceived);
        };

        function getIcon(iconKey) {
            if (icons[iconKey]) {
                if (iconKey === 'Clear') {
                    return icons[iconKey][utils.isDay() ? 'day' : 'night'];
                }
                return icons[iconKey];
            }
        };
    };
    var utils = {
        isDay: function () {
            var hours = new Date().getHours();
            if (hours > 6 && hours < 20) {
                return true;
            }
            return false;
        }
    };

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

    var degreeSystem = {
        cel: 'C',
        fah: 'F'
    };

})();
