let video;
let detections = null;
let state = 1; // 0=arrival(loading page) 1=observtion(proper face detection) 2=misinterpretation(slight error) 3=Escalation(many errros)  4=breakdown(shutdown and revel message)

//vars from misinterpretation visuals
let cols,
  rows,
  field = [],
  rez = 20;
let overlayMix = 0;
let bandStartMs = 0,
  currentBand = -1;
const STABLE_TIME = 9000,
  RAMP_TIME = 14000;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  //load in face-api models
  const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  console.log("loaded face api models");

  // runs detection once every 400, increase if lagging
  setInterval(detectFace, 400);

   //function to initliaze visuals before anything runs
  initVisuals();
}

function initVisuals() {
  cols = ceil(width / rez);
  rows = ceil(height / rez);
  field = [];
  for (let i = 0; i < cols * rows; i++) field[i] = random(TWO_PI);
  bandStartMs = millis();
}

//changes color based on the emotions detected
function getEmotionColor(e, hb) {
  let boost = map(hb, 0.5, 5, 0, 80);
  if (e < 0.2) return color(70, 100 + boost, 255);
  if (e < 0.4) return color(100, 200 + boost, 255);
  if (e < 0.6) return color(255, 150 + boost, 60);
  if (e < 0.8) return color(255, 60, 60 + boost);
  return color(170 + boost, 40, 220);
}

async function detectFace() {
  // make sure the video exists and is ready to use
  if (!video.elt || video.elt.readyState !== 4) return;

  // detect a single face in the video frame
  detections = await faceapi
    .detectSingleFace(video.elt, new faceapi.SsdMobilenetv1Options())
    .withFaceExpressions();
}

function draw() {
  background(0);

  //state determine code to run
  switch (state) {
    case 0: //arrival
      break;
    case 1: // observation
      image(video, 0, 0, width, height);
      drawState1();
      break;
    case 2: // misinterpretation
      image(video, 0, 0, width, height);
      drawState2();
      break;
    case 3: //escalation
      image(video, 0, 0, width, height);
      drawState3();
      break;
    case 4: //breakdown
      image(video, 0, 0, width, height);
      drawState4();
      break;
  }

  //display which state its in
  const stateTitles = [
    "Arrival",
    "Observation",
    "Misinterpretation",
    "Escalation",
    "Breakdown",
  ];
  fill(255);
  textAlign(CENTER);
  textSize(32);
  text(stateTitles[state], width / 2, 40);

  //function to display back button
  goBackButton();
}

function drawState0() {
  //welcome page goes here
}

function drawState1() {
   //obersavtion emotion detection
  if (detections) {
    drawBox(detections.detection.box); //detection box
    drawEmotions(detections.expressions); //emotion values

    //visual succesfull scannign visuals
    let box = detections.detection.box;
    let scaleX = width / 640;
    let scaleY = height / 480;

    // grid that pulses overlay
    let gridPulse = 0.3 + 0.2 * sin(frameCount * 0.03);
    stroke(0, 255, 0, 40 * gridPulse);
    strokeWeight(1);
    for (let x = box.x * scaleX; x < (box.x + box.width) * scaleX; x += 30) {
      line(x, box.y * scaleY, x, (box.y + box.height) * scaleY);
    }
    for (let y = box.y * scaleY; y < (box.y + box.height) * scaleY; y += 30) {
      line(box.x * scaleX, y, (box.x + box.width) * scaleX, y);
    }

    // scanner with a trail
    let scanProgress = (frameCount * 0.5) % box.height; //progress bar speed
    for (let i = 0; i < 20; i++) {
      let trailY = (box.y + scanProgress - i * 2) * scaleY;
      let alpha = map(i, 0, 20, 150, 0);
      stroke(0, 255, 0, alpha);
      strokeWeight(2);
      line(box.x * scaleX, trailY, (box.x + box.width) * scaleX, trailY);
    }

    //progress bar
    let progress = scanProgress / box.height;
    let barY = (box.y + box.height + 10) * scaleY;
    noStroke();
    fill(0, 255, 0, 50);
    rect(box.x * scaleX, barY, box.width * scaleX, 4);
    fill(0, 255, 0, 200);
    rect(box.x * scaleX, barY, box.width * scaleX * progress, 4);
  }
}

function drawState2() {
  //slight error with detection (misinterpretation)
  if (detections) {
    drawBox(detections.detection.box);
    drawEmotions(detections.expressions, 0.5); // 50% distortion

    if (detections) {
      //fades in
      overlayMix = lerp(overlayMix, 1, 0.03);

      let emotion = 0.5,
        heartbeat = 1.4;
      if (detections.expressions) {
        let top = Object.entries(detections.expressions).sort(
          (a, b) => b[1] - a[1]
        )[0];
        emotion =
          {
            neutral: 0.1,
            happy: 0.35,
            surprised: 0.55,
            sad: 0.65,
            disgusted: 0.85,
            angry: 0.78,
            fearful: 0.92,
          }[top[0]] || 0.5;
        heartbeat = map(1 - detections.expressions.neutral, 0, 1, 0.7, 4.2);
      }

      let col = getEmotionColor(emotion, heartbeat);

      //updates the field
      for (let i = 0; i < field.length; i++) {
        field[i] += random(-0.03 * heartbeat, 0.03 * heartbeat);
      }

      //draws flowfield
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let angle = field[x + y * cols];
          let px = x * rez + rez / 2,
            py = y * rez + rez / 2;
          let dx = cos(angle) * heartbeat * 2,
            dy = sin(angle) * heartbeat * 2;

          stroke(
            red(col) + random(-30, 30),
            green(col) + random(-30, 30),
            blue(col) + random(-30, 30),
            180 * overlayMix
          );
          strokeWeight(rez * 0.65);
          line(px, py, px + dx, py + dy);
        }
      }

      drawBox(detections.detection.box);
      drawEmotions(detections.expressions, 0.5);
    }
  }
}

function drawState3() {
  //many errors with detection
  if (detections) {
    drawBox(detections.detection.box);
    drawEmotions(detections.expressions, 0.75); // 75% distortion
  }
}

function drawState4() {
  if (detections) {
    //adds static noise on top of webcam feed
    for (let i = 0; i < 3000; i++) {
      let x = random(width);
      let y = random(height);
      stroke(random(255), random() < 0.1 ? 255 : 0);
      point(x, y);
    }
    
    //broken blocks
    let blockSize = 80;
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        if (random() < 0.4) {
          let offsetX = random(-20, 20);
          let offsetY = random(-10, 10);
          copy(x, y, blockSize, blockSize, x + offsetX, y + offsetY, blockSize, blockSize);
        }
      }
    }
    
    //glitchy scanning lines
    noFill();
    for (let i = 0; i < 8; i++) {
      let y = (frameCount * (5 + i * 3) + i * 60) % height;
      let thickness = random(3, 15);
      stroke(0, random(150, 255));
      strokeWeight(thickness);
      line(0, y, width, y);
      stroke(255, random(100, 200));
      strokeWeight(thickness * 0.5);
      line(0, y + 1, width, y + 1);
    }
    
    drawBox(detections.detection.box);
    drawEmotions(detections.expressions, 1);
  }
  
}

//this distorts the values
function distortValue(v, amount) {
  return constrain(v + random(-amount, amount), 0, 1);
}

//used loop to print all detectable emotions and their values
function drawEmotions(expressions, errorAmount = 0) {
  fill(255);
  textFont("Arial");
  textSize(16);
  textAlign(LEFT, TOP);

  let y = 20;
  for (let emotion in expressions) {
    let v = expressions[emotion];
    //distorts it depending on state
    v = distortValue(v, errorAmount);
    let value = Math.round(v * 100);
    text(emotion + ": " + value + "%", 10, y);
    y += 20;
  }
}

function drawBox(box) {
  //default is green detection box around face
  noFill();

  //observation= green
  if (state === 1) stroke(0, 255, 0);

  //misinterpreation=orange
  if (state === 2)
    stroke(frameCount % 10 < 8 ? color(255, 165, 0) : color(255, 165, 0, 50));

  // escalaton =red
  if (state === 3)
    stroke(frameCount % 10 < 5 ? color(255, 0, 0) : color(255, 0, 0, 50));

  //breakdown = white
  if (state === 4) stroke(255);

  strokeWeight(2);
  let scaleX = width / 640;
  let scaleY = height / 480;
  rect(box.x * scaleX, box.y * scaleY, box.width * scaleX, box.height * scaleY);
  stroke(0, 0, 0);
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    //advance stats with right arrow
    state = min(state + 1, 4);
    console.log("state:" + state);
  }
  if (keyCode === LEFT_ARROW) {
    //go back with left arrow
    state = max(state - 1, 0);
    console.log("state:" + state);
  }
}

function mousePressed() {
  //detects go back button
  if (mouseX < 140 && mouseY > height - 40) {
    window.location.href = "main_menu.html";
  }
}

function goBackButton() {
  //matches welcome page theme
  let bw = 140,
    bh = 40;
  let bx = 20,
    by = height - 60;

  let hovering =
    mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;

  stroke(hovering ? color(180, 120, 255) : 120);
  strokeWeight(1.5);
  fill(hovering ? color(80, 0, 120, 180) : color(30, 0, 60, 140));
  rect(bx, by, bw, bh, 12);

  noStroke();
  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);
  textFont("Arial");
  text("back to menu", bx + 15, by + 13);
}

function windowResized() {
  //to make sure canvas=window size
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
}
