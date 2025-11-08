const API_KEY = "b9a954dde05a0f81bdc32aa5d03b13a2";
const LAT = 45.52;   // Change to your city
const LON = -122.68; // Change to your city

async function getWeather() {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url);
  return res.json();
}

function mapWeatherToParams(data) {
  const t = data.main.temp;          // temperature C
  const clouds = data.clouds.all;    // %
  const humidity = data.main.humidity;  
  const wind = data.wind.speed;      // m/s
  const time = data.dt;
  const sunrise = data.sys.sunrise;
  const sunset = data.sys.sunset;

  // Determine day/night brightness
  const isDay = time > sunrise && time < sunset;
  const brightness = isDay ? 1.0 : 0.6;

  // Mapping logic
  return {
    // Color hue based on temperature
    hue: mapRange(t, -5, 35, 200, 20),   // blue → orange/red

    // Noise from cloudiness
    noiseStrength: mapRange(clouds, 0, 100, 0.02, 0.2),

    // Shape angle from wind
    angle: mapRange(wind, 0, 15, 0, 45),

    // Blur from humidity
    blur: mapRange(humidity, 20, 100, 0, 20),

    brightness
  };
}

// Helper function to map ranges
function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ( (value - inMin) * (outMax - outMin) ) / (inMax - inMin);
}
