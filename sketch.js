let waveCount = 12;
let waveSpacing;
let waveOffsets = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL);
  textAlign(CENTER, CENTER);
  textSize(40);
  noStroke();

  // Initialize wave offsets for natural motion
  for (let i = 0; i < waveCount; i++) {
    waveOffsets.push(random(1000));
  }

  fetchWeather();
}

function draw() {
  if (!weatherData || !params) return;

  // 1. Dynamic background gradient based on temperature + subtle time-based shift
  let tNorm = constrain((params.temp - params.tempMin) / (params.tempMax - params.tempMin), 0, 1);

  for (let y = 0; y < height; y++) {
    // Base gradient interpolation
    let topColor = color(200, 70, 50); // blue
    let bottomColor = color(20, 80, 60); // red

    let interColor = lerpColor(topColor, bottomColor, tNorm);

    // Add subtle hue oscillation for liveliness
    let hueShift = sin(frameCount * 0.002 + y*0.01) * 5;
    let c = lerpColor(interColor, color((hue(interColor) + hueShift)%360, saturation(interColor), lightness(interColor)), y / height);
    stroke(c);
    line(0, y, width, y);
  }

  // 2. Wind waves (animated, layered)
  waveSpacing = height / waveCount;
  for (let i = 0; i < waveCount; i++) {
    let yBase = i * waveSpacing + waveSpacing / 2;
    let waveAmp = params.windSpeed * 5;  // amplitude based on wind
    let waveFreq = 0.015;                // frequency
    let speed = 0.03 + i * 0.002;        // slight variation per wave layer

    beginShape();
    fill(0, 0, 100, 0.03);  // soft translucent white
    for (let x = 0; x <= width; x += 10) {
      // Combine sine + perlin noise for smooth organic motion
      let yOffset = sin((x * waveFreq) + frameCount * speed + waveOffsets[i]) * waveAmp;
      yOffset += (noise(x*0.005, i*0.1, frameCount*0.002) - 0.5) * 10; // subtle random wiggle
      vertex(x, yBase + yOffset);
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);
  }

  // 3. Overlay text info (center)
  fill(0,0,100);
  text(`${params.location}\n${params.temp.toFixed(1)}°C, Wind ${params.windSpeed.toFixed(1)} m/s`, width / 2, height / 2);
}

// 4. Responsive canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

