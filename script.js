const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const weatherContainer = document.getElementById("weatherContainer");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");

const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weatherIcon");
const weatherCondition = document.getElementById("weatherCondition");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const temperatureDetail = document.getElementById("temperatureDetail");

const forecastContainer = document.getElementById("forecastContainer");


searchBtn.addEventListener("click", function () {
    const city = cityInput.value.trim();

    if (city === "") {
        errorMessage.textContent = "Please enter a city name.";
        return;
    }

    getWeather(city);
});


cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});


locationBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
        errorMessage.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    loading.style.display = "block";
    errorMessage.textContent = "";

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            getWeatherByLocation(latitude, longitude);
        },
        function () {
            loading.style.display = "none";
            errorMessage.textContent = "Unable to get your location.";
        }
    );
});


async function getWeather(city) {

    loading.style.display = "block";
    errorMessage.textContent = "";
    weatherContainer.style.display = "none";

    try {

        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const locationData = await locationResponse.json();

        if (!locationData.results || locationData.results.length === 0) {
            throw new Error("City not found.");
        }

        const location = locationData.results[0];

        await getWeatherByLocation(
            location.latitude,
            location.longitude,
            location.name,
            location.country
        );

    } catch (error) {

        loading.style.display = "none";
        errorMessage.textContent = error.message;
    }
}


async function getWeatherByLocation(latitude, longitude, name, country) {

    try {

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&forecast_days=1&timezone=auto`
        );

        const weatherData = await weatherResponse.json();

        if (!name || !country) {
            name = "Your Location";
            country = "";
        }

        displayWeather(weatherData, name, country);

    } catch (error) {

        errorMessage.textContent = "Unable to get weather data.";

    } finally {

        loading.style.display = "none";
    }
}


function displayWeather(data, name, country) {

    const current = data.current;

    cityName.textContent = name;
    countryName.textContent = country;

    temperature.textContent = current.temperature_2m;

    humidity.textContent = current.relative_humidity_2m;

    windSpeed.textContent = current.wind_speed_10m;

    temperatureDetail.textContent = current.temperature_2m;

    const currentWeather = getWeatherInfo(current.weather_code);

    weatherIcon.textContent = currentWeather.icon;
    weatherCondition.textContent = currentWeather.description;

    weatherContainer.style.display = "block";

    displayHourlyForecast(data);
}


function displayHourlyForecast(data) {

    forecastContainer.innerHTML = "";

    const currentTime = new Date();

    let currentHour = currentTime.getHours();

    const times = data.hourly.time;
    const temperatures = data.hourly.temperature_2m;
    const weatherCodes = data.hourly.weather_code;

    let startIndex = 0;

    for (let i = 0; i < times.length; i++) {

        const forecastTime = new Date(times[i]);

        if (forecastTime.getHours() >= currentHour) {
            startIndex = i;
            break;
        }
    }

    for (
        let i = startIndex;
        i < Math.min(startIndex + 8, times.length);
        i++
    ) {

        const time = new Date(times[i]);

        const timeText = time.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });

        const weather = getWeatherInfo(weatherCodes[i]);

        const forecastCard = document.createElement("div");

        forecastCard.className = "forecast-card";

        forecastCard.innerHTML = `
            <h3>${timeText}</h3>
            <div class="forecast-icon">${weather.icon}</div>
            <p>${Math.round(temperatures[i])}°C</p>
            <small>${weather.description}</small>
        `;

        forecastContainer.appendChild(forecastCard);
    }
}


function getWeatherInfo(code) {

    if (code === 0) {
        return {
            icon: "☀️",
            description: "Clear Sky"
        };
    }

    if (code === 1 || code === 2) {
        return {
            icon: "🌤️",
            description: "Partly Cloudy"
        };
    }

    if (code === 3) {
        return {
            icon: "☁️",
            description: "Cloudy"
        };
    }

    if (code === 45 || code === 48) {
        return {
            icon: "🌫️",
            description: "Foggy"
        };
    }

    if (code >= 51 && code <= 57) {
        return {
            icon: "🌦️",
            description: "Drizzle"
        };
    }

    if (code >= 61 && code <= 67) {
        return {
            icon: "🌧️",
            description: "Rain"
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            icon: "❄️",
            description: "Snow"
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            icon: "🌦️",
            description: "Rain Showers"
        };
    }

    if (code >= 85 && code <= 86) {
        return {
            icon: "🌨️",
            description: "Snow Showers"
        };
    }

    if (code >= 95) {
        return {
            icon: "⛈️",
            description: "Thunderstorm"
        };
    }

    return {
        icon: "🌤️",
        description: "Unknown"
    };
}


getWeather("Mathura");