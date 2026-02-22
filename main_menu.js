let particles = [];
let buttons = [];
let glitchOffset = 0;
let lightningTimer = 0;
let rayAngle = 0;
let distortionOffset = 0;

let lastW = 0;
let lastH = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Amarante");

  // particles
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(1,4),
      speed: random(0.2, 0.8)
    });
  }

  // Buttons
  buttons.push(new MenuButton("BEGIN READING", 0));
  buttons.push(new MenuButton("ABOUT THE MACHINE", 0));
  //buttons.push(new MenuButton("ENTER SURVEILLANCE", height/2 + 80));
  
  lastW = windowWidth;
  lastH = windowHeight;
}

function layoutButtonsCentered() {
  const cx = width / 2;

  const baseY = height / 2 + 10;
  const spacing = 62;

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].x = cx;
    buttons[i].y = baseY + i * spacing;
  }
}

function draw() {
  drawGradient();
  drawColorRays();
  drawParticles();
  drawTitle();
  drawGlitchEffect();
  drawLightning();
  drawDistortion();
  layoutButtonsCentered();

  buttons.forEach(b => {
    b.display();
    b.checkHover();
  });
}

// Background
function drawGradient(){
  for(let y=0; y<height; y++){
    let inter = map(y,0,height,0,1);
    let c = lerpColor(
      color(20 + sin(frameCount*0.01)*10,0,40),
      color(5,0,15),
      inter
    );
    stroke(c);
    line(0,y,width,y);
  }
}

// Rays
function drawColorRays() {
  rayAngle += 0.002;
  push();
  translate(width/2, height/2);
  noFill();
  strokeWeight(2);
  for(let i=0; i<6; i++){
    let c = color(100 + 50*sin(frameCount*0.02 + i), 0, 200 + 50*cos(frameCount*0.02 + i), 20);
    stroke(c);
    let radius = 200 + 50*sin(frameCount*0.01 + i);
    line(0,0, cos(rayAngle+i) * radius, sin(rayAngle+i) * radius);
  }
  pop();
}

// Floating particles
function drawParticles(){
  noStroke();
  fill(255,180);

  particles.forEach(p=>{
    ellipse(p.x,p.y,p.size);

    p.y -= p.speed;

    if(p.y < 0){
      p.y = height;
      p.x = random(width);
    }
  });
}

// Title
function drawTitle(){
  textAlign(CENTER);

  fill(255);
  textSize(60);
  text("Identity: Processing", width/2, height/3);

  textSize(18);
  fill(200);
  text("Step closer and our metrics will begin to read you now but please remain still while I interpret your presence.", width/2, height/3 + 40);
}

// Glitch
function drawGlitchEffect() {
  glitchOffset = random([-2, -1, 0, 1, 2]);
  for (let i = 0; i < 5; i++) {
    if (random() < 0.05) {
      fill(255, random(50,150));
      rect(random(width), random(height), random(30,80), random(2,8));
    }
  }
  push();
  translate(glitchOffset, 0); 
  pop();
}

// Flicker
function drawLightning() {
  lightningTimer++;
  if(random() < 0.005 || lightningTimer > 300){
    fill(255, random(50,150));
    rect(0, 0, width, height);
    lightningTimer = 0;
  }
}

// background distortion
function drawDistortion() {
  distortionOffset = sin(frameCount*0.01) * 3;
  push();
  translate(distortionOffset, 0);
  for(let y = 0; y < height; y+=4){
    stroke(255, 10);
    let drift = sin(frameCount*0.01 + y*0.05) * 2;
    line(0, y + drift, width, y);
  }
  pop();
}

// Button
class MenuButton{
  constructor(label, y){
    this.label = label;
    this.x = width/2;
    this.y = y;
    this.w = 260;
    this.h = 50;
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
    textSize(16);
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

// Navigation
function mousePressed(){
  buttons.forEach(b=>{
    if(b.hover){
      if(b.label === "BEGIN READING"){
        window.location.href = "face.html"; 
      }
      if(b.label === "ABOUT THE MACHINE"){
        window.location.href = "about.html";
      }
      // if(b.label === "ENTER SURVEILLANCE"){
      //   window.location.href = "code2.html";
      // }
    }
  });
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
