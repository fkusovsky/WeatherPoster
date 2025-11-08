let weatherData;
let params;

// Replace with your OpenWeather API key
const API_KEY = "b9a954dde05a0f81bdc32aa5d03b13a2";

// Fetch weather for specific coordinates
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();

    if (data.cod !== 200) {
      console.error("Weather fetch error:", data);
      return;
    }

    weatherData = data;

    const temp = data.main.temp;
    params = {
      temp: temp,
      tempMin: -10,
      tempMax: 35,
      windSpeed: data.wind.speed,
      windDir: data.wind.deg,
      location: `${data.name}, ${data.sys.country}`
    };

    console.log("Weather data loaded:", params);
  } catch (err) {
    console.error(err);
  }
}

// Get weather based on user's geolocation
function getUserWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(lat, lon);
      },
      (err) => {
        console.warn("Geolocation failed, using default location.");
        fetchWeather(45.52, -122.68); // fallback: Portland
      }
    );
  } else {
    console.warn("Geolocation not supported, using default location.");
    fetchWeather(45.52, -122.68); // fallback: Portland
  }
}
