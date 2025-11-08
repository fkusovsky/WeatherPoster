let weatherData;
let params;

const API_KEY = "Yb9a954dde05a0f81bdc32aa5d03b13a2";

// Function to get weather for given coordinates
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
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

// Function to get user location
function getUserWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(lat, lon);
      },
      (err) => {
        console.warn("Geolocation failed, falling back to default location.");
        // Fallback: Portland
        fetchWeather(45.52, -122.68);
      }
    );
  } else {
    console.warn("Geolocation not supported, using default location.");
    fetchWeather(45.52, -122.68);
  }
}

