let params = null;
let lastUpdate = 0;

function setup() {
  // Poster aspect (1080x1620)
  const c = createCanvas(540, 810); 
  c.parent("poster-container");
  colorMode(HSL);

  fetchAndUpdate();
  setInterval(fetchAndUpdate, 10 * 60 * 1000); // every 10 min
}

async function fetchAndUpdate() {
  const weather = await getWeather();
  params = mapWeatherToParams(weather);
}

function draw() {
  if (!params) return;

  background(params.hue, 60, 30 * params.brightness);

  // Shape noise
  randomSeed(frameCount);

  // Draw a few shapes based on weather
  push();
  translate(width / 2, height / 2);
  rotate(radians(params.angle));
  
  noStroke();
  fill((params.hue + 30) % 360, 70, 60 * params.brightness);

  // Main shape
  ellipse(0, 0, 300, 400);

  // Cloudiness texture
  for (let i = 0; i < 150; i++) {
    fill((params.hue + 10) % 360, 40, random(20, 40));
    ellipse(
      random(-200, 200),
      random(-300, 300),
      random(5, 20),
      random(5, 20)
    );
  }
  pop();

  // Add blur if humidity is high
  if (params.blur > 1) {
    drawingContext.filter = `blur(${params.blur}px)`;
  } else {
    drawingContext.filter = "none";
  }
}
