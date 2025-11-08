let weatherData;
let params;

// Replace with your OpenWeather API key
const API_KEY = "YOUR_KEY";

// Fetch weather for specific coordinates
async function fetchWeather(lat, lon) {
  try {
    // 1. Find nearby cities/stations
    const nearbyRes = await fetch(
      `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=5&units=metric&appid=${API_KEY}`
    );
    const nearbyData = await nearbyRes.json();

    if (!nearbyData.list || nearbyData.list.length === 0) {
      console.error("No nearby weather stations found, falling back.");
      return;
    }

    // 2. Pick the closest station
    let closest = nearbyData.list[0];
    let minDist = distance(lat, lon, closest.coord.lat, closest.coord.lon);
    for (let station of nearbyData.list) {
      let d = distance(lat, lon, station.coord.lat, station.coord.lon);
      if (d < minDist) {
        minDist = d;
        closest = station;
      }
    }

    weatherData = closest;

    params = {
      temp: closest.main.temp,
      tempMin: -10,
      tempMax: 35,
      windSpeed: closest.wind.speed,
      windDir: closest.wind.deg,
      location: `${closest.name}, ${closest.sys.country}`
    };

    console.log("Weather data loaded (nearest station):", params);
  } catch (err) {
    console.error(err);
  }
}

// Haversine formula to calculate distance between lat/lon in km
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    sin(dLat/2) * sin(dLat/2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    sin(dLon/2) * sin(dLon/2);
  const c = 2 * atan2(sqrt(a), sqrt(1-a));
  return R * c;
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
