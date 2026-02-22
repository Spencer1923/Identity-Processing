console.log("about.js loaded");

let particles = [];
let buttons = [];
let glitchOffset = 0;
let lightningTimer = 0;
let rayAngle = 0;
let distortionOffset = 0;

// -------------------- Button Class (FIX) --------------------
class MenuButton {
  constructor(label, yOffset) {
    this.label = label;
    this.x = 0;
    this.y = 0;
    this.yOffset = yOffset || 0;
    this.w = 220;
    this.h = 54;
    this.hover = false;
  }

  checkHover() {
    this.hover =
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2;
  }

  display() {
    push();
    rectMode(CENTER);
    textAlign(CENTER, CENTER);

    // button glow
    noStroke();
    fill(160, 90, 255, this.hover ? 60 : 30);
    rect(this.x, this.y, this.w + 16, this.h + 12, 16);

    // button body
    stroke(200, this.hover ? 220 : 160);
    strokeWeight(1.2);
    fill(10, 0, 20, 190);
    rect(this.x, this.y, this.w, this.h, 14);

    // label
    noStroke();
    fill(255, this.hover ? 255 : 220);
    textSize(18);
    text(this.label, this.x, this.y);

    pop();
  }
}

function setup() {
  console.log("setup ran");
  createCanvas(windowWidth, windowHeight);
  //textFont("Amarante"); // if font isn't loaded, p5 will fallback (won't crash)
  //textWrap(WORD);

  // particles
  for (let i = 0; i < 90; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(1, 4),
      speed: random(0.15, 0.75),
      drift: random(0.1, 0.6)
    });
  }

  // Buttons (single back button)
  buttons.push(new MenuButton("BACK", 0));
}

function draw() {
  // If anything weird happens, at least clear the frame:
  background(0);

  drawGradient();
  drawColorRays();
  drawParticles();
  drawGlitchEffect();
  drawLightning();
  drawDistortion();

  drawHeader();
  drawContentPanel();

  layoutButtons();

  buttons.forEach(b => {
    b.checkHover();
    b.display();
  });
}

// -------------------- Layout --------------------
function layoutButtons() {
  const cx = width / 2;
  const y = height - 70;
  buttons[0].x = cx;
  buttons[0].y = y;
}

// -------------------- Background --------------------
function drawGradient() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(
      color(20 + sin(frameCount * 0.01) * 10, 0, 40),
      color(5, 0, 15),
      inter
    );
    stroke(c);
    line(0, y, width, y);
  }
}

// Rays
function drawColorRays() {
  rayAngle += 0.002;
  push();
  translate(width / 2, height / 2);
  noFill();
  strokeWeight(2);

  for (let i = 0; i < 7; i++) {
    let c = color(
      100 + 50 * sin(frameCount * 0.02 + i),
      0,
      200 + 50 * cos(frameCount * 0.02 + i),
      18
    );
    stroke(c);
    let radius = 240 + 70 * sin(frameCount * 0.01 + i);
    line(0, 0, cos(rayAngle + i) * radius, sin(rayAngle + i) * radius);
  }
  pop();
}

// Floating particles
function drawParticles() {
  noStroke();
  fill(255, 180);

  particles.forEach(p => {
    ellipse(p.x, p.y, p.size);

    p.y -= p.speed;
    p.x += sin(frameCount * 0.01 + p.y * 0.02) * p.drift;

    if (p.y < -10) {
      p.y = height + 10;
      p.x = random(width);
    }
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
  });
}

// -------------------- Effects --------------------
function drawGlitchEffect() {
  glitchOffset = random([-2, -1, 0, 1, 2]);

  // random thin glitch bars
  for (let i = 0; i < 6; i++) {
    if (random() < 0.06) {
      fill(255, random(40, 120));
      rect(random(width), random(height), random(40, 120), random(2, 10));
    }
  }

  // small scan-ish blocks
  for (let i = 0; i < 4; i++) {
    if (random() < 0.03) {
      fill(180, 120, 255, random(25, 70));
      rect(random(width), random(height), random(20, 80), random(6, 18));
    }
  }

  push();
  translate(glitchOffset, 0);
  pop();
}

function drawLightning() {
  lightningTimer++;
  if (random() < 0.004 || lightningTimer > 320) {
    fill(255, random(35, 120));
    rect(0, 0, width, height);
    lightningTimer = 0;
  }
}

function drawDistortion() {
  distortionOffset = sin(frameCount * 0.01) * 3;
  push();
  translate(distortionOffset, 0);
  for (let y = 0; y < height; y += 4) {
    stroke(255, 10);
    let drift = sin(frameCount * 0.01 + y * 0.05) * 2;
    line(0, y + drift, width, y);
  }
  pop();
}

// -------------------- Text / UI --------------------
function drawHeader() {
  textAlign(CENTER);
  fill(255);
  textSize(52);
  text("ABOUT THE MACHINE", width / 2, height / 6);

  fill(200);
  textSize(18);
  text("✧A brief interface disclosure✧", width / 2, height / 6 + 36);
}

function drawContentPanel() {
  const panelW = min(850, width * 0.88);
  const panelH = min(520, height * 0.68);
  const cx = width / 2;
  const cy = height / 2 + 20;

  // glow
  push();
  rectMode(CENTER);
  noStroke();
  fill(120, 60, 200, 30);
  rect(cx, cy, panelW + 20, panelH + 20, 18);
  pop();

  // panel
  push();
  rectMode(CENTER);
  stroke(140);
  strokeWeight(1.2);
  fill(15, 0, 30, 175);
  rect(cx, cy, panelW, panelH, 16);
  pop();

  // TEXT AREA
  const margin = 42;
  const x = cx - panelW / 2 + margin;
  const y = cy - panelH / 2 + margin;
  const tw = panelW - margin * 2;

  const aboutText =
    "This machine reads you.\n" +
    "Using facial detection, movement tracking, and behavioral analysis, it attempts to interpret your emotional state in real time. As you stand before it, it observes, labels, and categorizes.\n\n" +
    "What it detects does not remain invisible.\n\n" +
    "The visuals around you respond to its interpretations — shifting in color, movement, and intensity based on what the system believes you are feeling. Subtle changes may ripple through the environment. Light may soften or sharpen. Motion may grow calm or restless.\n\n" +
    "The experience unfolds gradually.\n\n" +
    "At first, the system feels attentive. Measured. Curious about who you are.\n\n" +
    "As it continues, its responses become more confident. More assertive. More certain about what it believes it sees.\n\n" +
    "You may feel noticed. Defined. Questioned.\n\n" +
    "Remain present. Remain aware.\n\n" +
    "It is watching.";

  // draw text
  push();
  noStroke();
  fill(255);
  textSize(18);
  textLeading(28);
  textAlign(LEFT, TOP);

  const lines = wrapText(aboutText, tw);
  let yy = y;

  for (let i = 0; i < lines.length; i++) {
    text(lines[i], x, yy);
    yy += 28;
    if (yy > y + panelH - margin - 28) break;
  }
  pop();

  // footer hint
  push();
  textAlign(CENTER);
  textSize(14);
  fill(190, 140);
  text("press BACK when you’re ready", width / 2, cy + panelH / 2 - 18);
  pop();
}

// wraps text into lines that fit maxWidth
function wrapText(str, maxWidth) {
  const out = [];
  const paragraphs = str.split("\n");

  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p];

    if (para.trim() === "") {
      out.push("");
      continue;
    }

    const words = para.split(" ");
    let line = "";

    for (let i = 0; i < words.length; i++) {
      const test = line ? line + " " + words[i] : words[i];
      if (textWidth(test) > maxWidth) {
        out.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) out.push(line);
  }

  return out;
}

// -------------------- Navigation --------------------
function mousePressed() {
  buttons.forEach(b => {
    if (b.hover) {
      if (b.label === "BACK") {
        window.location.href = "main_menu.html";
      }
    }
  });
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    window.location.href = "main_menu.html";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}