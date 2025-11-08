let weatherData;
let params;

// Replace with your OpenWeather API key
const API_KEY = "b9a954dde05a0f81bdc32aa5d03b13a2";

// Fetch weather for specific coordinates and pick nearest station
async function fetchWeather(lat, lon) {
  try {
    // Find nearby cities/stations
    const nearbyRes = await fetch(
      `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=5&units=metric&appid=${API_KEY}`
    );
    const nearbyData = await nearbyRes.json();

    if (!nearbyData.list || nearbyData.list.length === 0) {
      console.error("No nearby weather stations found, using default.");
      return;
    }

    // Pick closest station
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
    console.error("Error fetching weather:", err);
  }
}

// Haversine formula to calculate distance in km
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

// Get user coordinates: try browser geolocation first, then IP fallback
async function getUserWeather() {
  let lat, lon;

  // 1. Try browser geolocation
  const geoPromise = new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        () => resolve(null), // failed or denied
        { timeout: 5000 }
      );
    } else {
      resolve(null); // not supported
    }
  });

  let geo = await geoPromise;

  if (geo && geo.accuracy < 50000) { // <50km is acceptable
    lat = geo.lat;
    lon = geo.lon;
    console.log("Using browser geolocation:", lat, lon);
  } else {
    // 2. Fallback to IP-based geolocation
    try {
      const ipRes = await fetch("https://ipapi.co/json/");
      const ipData = await ipRes.json();
      lat = parseFloat(ipData.latitude);
      lon = parseFloat(ipData.longitude);
      console.log("Using IP-based location:", lat, lon);
    } catch (err) {
      console.warn("IP geolocation failed, using default Portland.");
      lat = 45.52;
      lon = -122.68;
    }
  }

  // 3. Fetch weather from nearest station
  fetchWeather(lat, lon);
}
