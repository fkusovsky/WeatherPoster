let waveCount = 12;
let waveSpacing;
let waveOffsets = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  textAlign(CENTER, CENTER);
  textSize(40);
  noStroke();

  // Initialize wave offsets for natural motion
  for (let i = 0; i < waveCount; i++) {
    waveOffsets.push(random(1000));
  }

  // Get weather based on user location
  getUserWeather();
}

function draw() {
  if (!params) return; // wait until weather data is loaded

  // 1. Vertical temperature gradient
  for (let y = 0; y < height; y++) {
    let tNorm = constrain((params.temp - params.tempMin) / (params.tempMax - params.tempMin), 0, 1);

    // Multi-step gradient: blue -> yellow -> red
    let col;
    let coldColor = color(0, 120, 255);   // blue
    let midColor  = color(255, 220, 80);  // yellow
    let hotColor  = color(255, 50, 30);   // red

    if (tNorm < 0.5) {
      col = lerpColor(coldColor, midColor, tNorm * 2);
    } else {
      col = lerpColor(midColor, hotColor, (tNorm - 0.5) * 2);
    }

    // Optional subtle oscillation
    let hueShift = sin(frameCount * 0.002 + y * 0.01) * 5;
    col = lerpColor(col, color(red(col)+hueShift, green(col), blue(col)), y/height);

    stroke(col);
    line(0, y, width, y);
  }

  // 2. Animated wind waves
  waveSpacing = height / waveCount;
  for (let i = 0; i < waveCount; i++) {
    let yBase = i * waveSpacing + waveSpacing / 2;
    let waveAmp = params.windSpeed * 5;    // amplitude proportional to wind
    let waveFreq = 0.015;                  // frequency
    let speed = 0.03 + i * 0.002;          // slight variation per wave layer

    beginShape();
    fill(255, 255, 255, 8);  // soft translucent white
    for (let x = 0; x <= width; x += 10) {
      let yOffset = sin((x * waveFreq) + frameCount * speed + waveOffsets[i]) * waveAmp;
      yOffset += (noise(x*0.005, i*0.1, frameCount*0.002) - 0.5) * 10; // subtle wiggle
      vertex(x, yBase + yOffset);
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);
  }

  // 3. Center text info
  fill(255);
  text(`${params.location}\n${params.temp.toFixed(1)}°C, Wind ${params.windSpeed.toFixed(1)} m/s`, width/2, height/2);
}

// 4. Responsive canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

