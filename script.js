const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

// Your OpenWeather API Key
const API_KEY = "YOUR_API_KEY";

// Create weather cards
const createWeatherCard = (cityName, weatherItem, index) => {

    if (index === 0) {
        return `
            <div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h6>Temperature: ${weatherItem.main.temp}°C</h6>
                <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                <h6>Humidity: ${weatherItem.main.humidity}%</h6>
            </div>

            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                <h6>${weatherItem.weather[0].description}</h6>
            </div>
        `;
    } else {

        return `
            <li class="card">
                <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>

                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">

                <h6>Temp: ${weatherItem.main.temp}°C</h6>
                <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                <h6>Humidity: ${weatherItem.main.humidity}%</h6>
            </li>
        `;
    }
};

// Get weather details
const getWeatherDetails = (cityName, latitude, longitude) => {

    const WEATHER_API_URL =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => {

            if (!response.ok) {
                throw new Error("Weather data not found");
            }

            return response.json();
        })

        .then(data => {

            // Filter only one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {

                const forecastDate = new Date(forecast.dt_txt).getDate();

                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }

                return false;
            });

            // Clear old data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Add weather cards
            fiveDaysForecast.forEach((weatherItem, index) => {

                const html = createWeatherCard(cityName, weatherItem, index);

                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        })

        .catch(error => {
            alert("Error fetching weather data!");
            console.log(error);
        });
};

// Get city coordinates
const getCityCoordinates = () => {

    const cityName = cityInput.value.trim();

    if (cityName === "") return;

    const API_URL =
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL)
        .then(response => response.json())

        .then(data => {

            if (!data.length) {
                alert("City not found!");
                return;
            }

            const { lat, lon, name } = data[0];

            getWeatherDetails(name, lat, lon);
        })

        .catch(error => {
            alert("Error fetching city coordinates!");
            console.log(error);
        });
};

// Get user current location
const getUserCoordinates = () => {

    navigator.geolocation.getCurrentPosition(

        position => {

            const { latitude, longitude } = position.coords;

            const API_URL =
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(API_URL)
                .then(response => response.json())

                .then(data => {

                    const { name } = data[0];

                    getWeatherDetails(name, latitude, longitude);
                })

                .catch(error => {
                    alert("Error fetching current location!");
                    console.log(error);
                });
        },

        error => {

            if (error.code === error.PERMISSION_DENIED) {
                alert("Location permission denied!");
            } else {
                alert("Unable to get your location!");
            }
        }
    );
};

// Event listeners
searchButton.addEventListener("click", getCityCoordinates);

locationButton.addEventListener("click", getUserCoordinates);

cityInput.addEventListener("keyup", event => {

    if (event.key === "Enter") {
        getCityCoordinates();
    }
});
