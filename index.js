let particles = [];
let enterButton;

let flicker = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Amarante");

  // floating dust
  for (let i = 0; i < 140; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.15, 0.8),
      drift: random(0.2, 1.2),
      alpha: random(60, 190)
    });
  }

  enterButton = new MenuButton("ENTER THE FORTUNE", height/2 + 150);
}

function globeCX() { return width / 2; }
function globeCY() { return height / 2.15; }
function globeR()  { return min(width, height) * 0.16; }

function draw() {
  flicker = (random() < 0.01) ? random(0.97, 1.03) : lerp(flicker, 1, 0.08);

  drawMysticGradient();
  drawParticles();
  drawCrystalBall();
  drawRuneRing();
  drawOuterRuneRing();
  drawTitle();
  
  enterButton.x = globeCX();
  enterButton.y = globeCY() + globeR() + 30;

  enterButton.display();
  enterButton.checkHover();
  
  drawSubtleGlobalGlitch();
  applyCCTVFilter();
}


// ---------------- Background ----------------
function drawMysticGradient() {
  let pulse = 0.5 + 0.5 * sin(frameCount * 0.008);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let topC = color(6, 0, 18);
    let botC = color(30 + 15 * pulse, 0, 70 + 20 * pulse);
    let c = lerpColor(topC, botC, inter);

    stroke(red(c) * flicker, green(c) * flicker, blue(c) * flicker);
    line(0, y, width, y);
  }
}

// ---------------- Particles ----------------
function drawParticles() {
  noStroke();

  particles.forEach(p => {
    fill(230, 190, 255, p.alpha);
    ellipse(p.x, p.y, p.size);

    p.y -= p.speed;
    p.x += sin(frameCount * 0.01 + p.y * 0.02) * 0.25 * p.drift;

    p.alpha += sin(frameCount * 0.02 + p.x * 0.01) * 0.3;
    p.alpha = constrain(p.alpha, 30, 210);

    if (p.y < -10) {
      p.y = height + 10;
      p.x = random(width);
    }
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
  });
}

// ---------------- Mist inside globe ----------------
function drawMistyGlowInsideBall(cx, cy, r) {
  push();

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(cx, cy, r * 0.98, 0, Math.PI * 2);
  drawingContext.clip();

  let t = frameCount * 0.02;

  noStroke();
  fill(60 + 20 * sin(t * 0.7), 0, 120 + 30 * sin(t * 0.9), 40);
  ellipse(cx, cy, r * 2);

  for (let y = cy - r; y <= cy + r; y += 3) {

    let wave = sin(t * 2 + y * 0.05);

    let glitchJump =
      (random() < 0.02) ? random(-18, 18) : 0;

    let shift = wave * 6 + glitchJump;

    stroke(255, 18 + 20 * abs(wave));
    strokeWeight(1);
    line(cx - r + shift, y, cx + r + shift, y);

    stroke(180, 120, 255, 10 + 18 * abs(wave));
    line(cx - r + shift * 1.4, y + 1, cx + r + shift * 1.4, y + 1);
  }

  drawingContext.restore();
  pop();
}

// ---------------- Crystal Ball ----------------
function drawCrystalBall() {
  let cx = width / 2;
  let cy = height / 2.15;
  let r = min(width, height) * 0.16;

  push();

  // outer glow
  noStroke();
  for (let i = 10; i >= 1; i--) {
    let a = 6 + i * 1.2;
    fill(160, 90, 255, a);
    ellipse(cx, cy, (r * 2) + i * 18, (r * 2) + i * 18);
  }

  // glass sphere
  fill(40, 0, 80, 120);
  stroke(220, 180, 255, 90);
  strokeWeight(2);
  ellipse(cx, cy, r * 2, r * 2);
  
  drawMistyGlowInsideBall(cx, cy, r);

  noStroke();
  for (let i = 0; i < 14; i++) {
    if (random() < 0.12) {
      fill(255, 180);
      ellipse(
        cx + random(-r * 0.55, r * 0.55),
        cy + random(-r * 0.55, r * 0.55),
        random(1, 3)
      );
    }
  }

  // highlight
  noStroke();
  fill(255, 10);
  ellipse(cx - r * 0.35, cy - r * 0.35, r * 0.5, r * 0.35);

  pop();
}

// ---------------- Rune Ring ----------------
function drawRuneRing() {
  let cx = width / 2;
  let cy = height / 2.15;
  let r = min(width, height) * 0.22;

  const runes = ["✦","☾","✶","⚶","☉","✧","⌬","⟡"];

  push();
  textAlign(CENTER, CENTER);
  textSize(18);

  stroke(200, 160, 255, 40);
  noFill();
  ellipse(cx, cy, r * 2, r * 2);

  for (let i = 0; i < 20; i++) {
    let ang = frameCount * 0.01 + i * (TWO_PI / 20);
    let x = cx + cos(ang) * r;
    let y = cy + sin(ang) * r;

    fill(180, 120, 255, 40);
    text(runes[i % runes.length], x + 1, y + 1);

    fill(230, 200, 255, 140);
    text(runes[i % runes.length], x, y);
  }

  pop();
}

function drawOuterRuneRing() {
  let cx = width / 2;
  let cy = height / 2.15;

  let r = min(width, height) * 0.30;

  const runes2 = ["✺","✹","✷","✵","✶","✧","✦","☾","☉","⌬"];

  push();
  textAlign(CENTER, CENTER);
  textSize(16);

  // outer circle guide
  stroke(200, 160, 255, 18);
  strokeWeight(2);
  noFill();
  ellipse(cx, cy, r * 2, r * 2);

  // orbiting glyphs
  for (let i = 0; i < 28; i++) {
    let ang = -frameCount * 0.006 + i * (TWO_PI / 28);
    let x = cx + cos(ang) * r;
    let y = cy + sin(ang) * r;

    // glow
    fill(180, 120, 255, 28);
    text(runes2[i % runes2.length], x + 1, y + 1);

    // main
    fill(230, 200, 255, 95);
    text(runes2[i % runes2.length], x, y);
  }

  pop();
}


// ---------------- Curved Title ----------------
function drawTitle() {
  let cx = width / 2;
  let cy = height / 2.15;

  let innerRingR = min(width, height) * 0.22;   
  let outerRingR = min(width, height) * 0.30;   

  let jx = (random() < 0.05) ? random(-1.5, 1.5) : 0;
  let jy = (random() < 0.05) ? random(-1.5, 1.5) : 0;

  // 1) 
  textSize(52);
  fill(180, 120, 255, 70);
  drawTextOnArc("WELCOME", cx + 2 + jx, cy + jy, outerRingR * 1.02, -PI * 0.92, -PI * 0.08);

  fill(255);
  drawTextOnArc("WELCOME", cx + jx, cy + jy, outerRingR * 1.02, -PI * 0.92, -PI * 0.08);

  // 2) 
  textSize(18);
  fill(220, 200, 255, 190);
  drawTextOnArc("False Prophecy", cx + jx, cy + jy, innerRingR * 1.06, -PI * 0.78, -PI * 0.22);
}

function drawTextOnArc(str, cx, cy, radius, startAng, endAng) {
  push();
  textAlign(CENTER, CENTER);

  let chars = str.split("");
  let total = max(chars.length - 1, 1);
  let step = (endAng - startAng) / total;

  for (let i = 0; i < chars.length; i++) {
    let ang = startAng + step * i;

    let x = cx + cos(ang) * radius;
    let y = cy + sin(ang) * radius;

    push();
    translate(x, y);
    rotate(ang + HALF_PI);
    text(chars[i], 0, 0);
    pop();
  }

  pop();
}

// ---------------- Glitch ----------------

function drawSubtleGlobalGlitch() {
  push();

  if (random() < 0.02) {
    translate(random(-2, 2), 0);
  }

  stroke(255, 6);
  strokeWeight(1);
  for (let y = 0; y < height; y += 4) {
    let drift = sin(frameCount * 0.01 + y * 0.03) * 0.8;
    line(0, y + drift, width, y + drift);
  }

  noStroke();
  if (random() < 0.06) {
    let bars = int(random(1, 4));
    for (let i = 0; i < bars; i++) {
      let h = random(2, 10);
      let y = random(height);
      let xShift = random(-20, 20);
      fill(255, random(8, 20));
      rect(xShift, y, width, h);

      fill(180, 120, 255, random(6, 16));
      rect(xShift + random(-6, 6), y + 1, width, max(1, h * 0.6));
    }
  }

  pop();
}

//-------------------------------------

function applyCCTVFilter() {
  push();
  rectMode(CORNER);

  noStroke();
  fill(0, 255, 120, 18);   
  rect(0, 0, width, height);

  if (random() < 0.04) {
    fill(255, 18);
    rect(0, 0, width, height);
  }

  let bandY = (frameCount * 3.0) % height;
  fill(120, 255, 200, 22);
  rect(0, bandY, width, 10);
  fill(255, 20);
  rect(0, bandY + 12, width, 4);

  strokeWeight(1);
  for (let y = 0; y < height; y += 3) {
    let a = 6 + 6 * (0.5 + 0.5 * sin(frameCount * 0.02 + y * 0.08));
    stroke(0, 0, 0, a);        
    line(0, y, width, y);
  }

  noStroke();
  for (let i = 0; i < 800; i++) {
    let x = random(width);
    let y = random(height);

    if (random() < 0.85) fill(0, random(10, 25));
    else fill(255, random(10, 25));

    rect(x, y, 1, 1);
  }

  drawCCTVVignette();

  pop();
}

function drawCCTVVignette() {
  push();

  rectMode(CORNER);

  noFill();

  for (let i = 0; i < 8; i++) {
    stroke(0, 0, 0, 22 - i * 2);
    strokeWeight(60);
    rect(
      -i * 10,
      -i * 10,
      width + i * 20,
      height + i * 20
    );
  }

  pop();
}

// ---------------- Button ----------------
class MenuButton{
  constructor(label, y){
    this.label = label;
    this.x = width/2;
    this.y = y;
    this.w = 300;
    this.h = 60;
    this.hover = false;
  }

  display(){
    rectMode(CENTER);
    stroke(this.hover ? color(180,120,255) : 120);
    strokeWeight(1.5);
    fill(this.hover ? color(80,0,120,180) : color(30,0,60,140));
    rect(this.x,this.y,this.w,this.h,12);

    noStroke();
    fill(255);
    textSize(18);
    textAlign(CENTER,CENTER);
    text(this.label,this.x,this.y);
  }

  checkHover(){
    this.hover =
      mouseX > this.x - this.w/2 &&
      mouseX < this.x + this.w/2 &&
      mouseY > this.y - this.h/2 &&
      mouseY < this.y + this.h/2;
  }
}

function mousePressed(){
  if(enterButton.hover){
    window.location.href = "main_menu.html";
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  //enterButton.y = height/2 + 150;
}
