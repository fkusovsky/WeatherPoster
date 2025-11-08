let weatherData;
let params;

// Replace with your OpenWeather API key
const API_KEY = "b9a954dde05a0f81bdc32aa5d03b13a2";

// Fetch weather for coordinates and interpolate nearest 2–3 stations
async function fetchWeather(lat, lon) {
  try {
    // 1. Find nearby cities/stations (max 5)
    const nearbyRes = await fetch(
      `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=5&units=metric&appid=${API_KEY}`
    );
    const nearbyData = await nearbyRes.json();

    if (!nearbyData.list || nearbyData.list.length === 0) {
      console.error("No nearby weather stations found, using default.");
      return;
    }

    // 2. Sort stations by distance
    const stations = nearbyData.list.map(station => {
      return {
        ...station,
        distance: distance(lat, lon, station.coord.lat, station.coord.lon)
      };
    }).sort((a, b) => a.distance - b.distance);

    // 3. Pick top 2–3 closest stations for interpolation
    const topStations = stations.slice(0, 3);

    // Weighted average by inverse distance
    let tempSum = 0;
    let windSum = 0;
    let weightSum = 0;

    topStations.forEach(station => {
      const weight = 1 / (station.distance + 0.001); // avoid division by zero
      tempSum += station.main.temp * weight;
      windSum += station.wind.speed * weight;
      weightSum += weight;
    });

    const tempInterpolated = tempSum / weightSum;
    const windInterpolated = windSum / weightSum;

    // Use nearest station for location label
    const nearestStation = topStations[0];

    params = {
      temp: tempInterpolated,
      tempMin: -10,
      tempMax: 35,
      windSpeed: windInterpolated,
      windDir: nearestStation.wind.deg,
      location: `${nearestStation.name}, ${nearestStation.sys.country}`
    };

    console.log("Weather data loaded (interpolated):", params);

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

// Get user coordinates: browser geolocation first, then IP fallback
async function getUserWeather() {
  let lat, lon;

  // Browser geolocation
  const geoPromise = new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        }),
        () => resolve(null),
        { timeout: 5000 }
      );
    } else {
      resolve(null);
    }
  });

  const geo = await geoPromise;

  if (geo && geo.accuracy < 50000) { // <50 km
    lat = geo.lat;
    lon = geo.lon;
    console.log("Using browser geolocation:", lat, lon);
  } else {
    // IP fallback
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

  // Fetch weather with interpolation
  fetchWeather(lat, lon);
}
