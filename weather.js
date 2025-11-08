// Weather fetching
let weatherData;
let params;

// Replace with your OpenWeather key
const API_KEY = "b9a954dde05a0f81bdc32aa5d03b13a2";
const LAT = 45.52;
const LON = -122.68;

async function fetchWeather() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`);
    const data = await res.json();

    if (data.cod !== 200) {
      console.error("Weather fetch error:", data);
      return;
    }

    weatherData = data;

    // Map temperature to gradient range (hue)
    const temp = data.main.temp;
    params = {
      temp: temp,
      tempMin: -10,
      tempMax: 35,
      windSpeed: data.wind.speed,
      windDir: data.wind.deg,
      location: `${data.name}, ${data.sys.country}`
    };

  } catch (err) {
    console.error(err);
  }
}
