let video;
let detections = null;
let state = 1; // 0=arrival(loading page) 1=observtion(proper face detection) 2=misinterpretation(slight error) 3=Escalation(many errros)  4=breakdown(shutdown and revel message)

let cachedDistortions = {}; //to store distorted values

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
    let gridPulse = 0.3 + 0.2 * sin(frameCount * 0.008);
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
  if (detections) {
    //scanning line glitches
    for (let i = 0; i < 25; i++) {
      if (random() < 0.005) {
        let y = random(height);
        let h = random(2, 25);
        let offset = random(-15, 15);
        copy(0, y, width, h, offset, y, width, h);
      }
    }
    drawBox(detections.detection.box);
    drawEmotions(detections.expressions, 0.6); //distorts 60% of time

    let box = detections.detection.box;
    let scaleX = width / 640;
    let scaleY = height / 480;
    rection = random() < 0.2 ? 1 : -1;

    // random scanner movment
    let direction = frameCount % 180 < 90 ? 1 : -1;
    let scanProgress = abs((frameCount * 0.5 * direction) % box.height);

    for (let i = 0; i < 20; i++) {
      let trailY = (box.y + scanProgress - i * 2 * direction) * scaleY;
      let alpha = map(i, 0, 20, 150, 0);
      stroke(255, 165, 0, alpha);
      strokeWeight(2);
      line(box.x * scaleX, trailY, (box.x + box.width) * scaleX, trailY);
    }

    //glitchy status/progress bar
    let progress = scanProgress / box.height;
    if (frameCount % 180 < 30) progress = random(1);
    let barY = (box.y + box.height + 10) * scaleY;
    noStroke();
    fill(255, 165, 0, 50);
    rect(box.x * scaleX, barY, box.width * scaleX, 4);
    fill(255, 165, 0, 200);
    rect(box.x * scaleX, barY, box.width * scaleX * progress, 4);
  }
}

function drawState3() {
  //many errors with detection
  if (detections) {
    //red screen glitches
    for (let i = 0; i < 17; i++) {
      if (random() < 0.008) {
        let y = random(height);
        let h = random(2, 25);
        let offset = random(-30, 30);
        copy(0, y, width, h, offset, y, width, h);
        noStroke();
        fill(255, 0, 0, 80);
        rect(0, y, width, h);
      }
    }

    //red flashes/pulses liek an alarm
    if (frameCount % 60 < 15) {
      noStroke();
      fill(255, 0, 0, 80);
      rect(0, 0, width, height);
    }

    drawBox(detections.detection.box);
    drawEmotions(detections.expressions, 90); //90% distortion

    let box = detections.detection.box;
    let scaleX = width / 640;
    let scaleY = height / 480;

    //scanner that malfunctions
    let scanProgress = (frameCount * random(0.3, 2)) % box.height;
    for (let i = 0; i < 10; i++) {
      let trailY = (box.y + scanProgress - i * random(1, 4)) * scaleY;
      let alpha = map(i, 0, 20, 150, 0);
      stroke(255, 0, 0, alpha);
      strokeWeight(2);
      line(box.x * scaleX, trailY, (box.x + box.width) * scaleX, trailY);
    }

    //broken progression bar
    let progress = random(1);
    let barY = (box.y + box.height + 10) * scaleY;
    noStroke();
    fill(255, 0, 0, 50);
    rect(box.x * scaleX, barY, box.width * scaleX, 4);
    fill(255, 0, 0, 200);
    rect(box.x * scaleX, barY, box.width * scaleX * progress, 4);
  }
}

function drawState4() {
  //Breakdown visuals
  if (detections) {
    //broken blocks
    let blockSize = 120;
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        if (random() < 0.15) {
          let offsetX = random(-20, 20);
          let offsetY = random(-10, 10);
          copy(
            x,
            y,
            blockSize,
            blockSize,
            x + offsetX,
            y + offsetY,
            blockSize,
            blockSize
          );
        }
      }
    }

    //glitchy scanning lines
    noFill();
    for (let i = 0; i < 6; i++) {
      let y = (frameCount * (5 + i * 3) + i * 60) % height;
      let thickness = random(3, 15);
      stroke(0, random(150, 255));
      strokeWeight(thickness);
      line(0, y, width, y);
      stroke(255, random(100, 200));
      strokeWeight(thickness * 0.5);
      line(0, y + 1, width, y + 1);
    }
  }
}

//this distorts the values
function distortValue(emotion, v, amount) {
  if (amount === 0) return v;

  // only updates values when theres more than a 5% change detected
  const key = `${emotion}_${state}`;
  if (
    !cachedDistortions[key] ||
    abs(v - cachedDistortions[key].original) > 0.10
  ) {
    let distortAmount = amount * (state === 3 ? 2.5 : state === 2 ? 1.8 : 1);
    cachedDistortions[key] = {
      original: v,
      distorted: constrain(v + random(-distortAmount, distortAmount), 0, 1),
    };
  }
  return cachedDistortions[key].distorted;
}

//used loop to print all detectable emotions and their values
function drawEmotions(expressions, errorAmount = 0) {
  fill(255);
  textFont("Arial");
  textSize(16);
  textAlign(LEFT, TOP);

  let y = 20;
  const sorted = Object.entries(expressions)
    .map(([emotion, value]) => [
      emotion,
      distortValue(emotion, value, errorAmount),
    ])
    .sort((a, b) => b[1] - a[1]);

  for (const [emotion, value] of sorted) {
    const pct = Math.round(value * 100);
    text(`${emotion}: ${pct}%`, 10, y);
    y += 20;
  }
  const [topEmotion, topValue] = sorted[0];
  textSize(20);
  textAlign(CENTER, BOTTOM);
  text(
    `Most likely: ${topEmotion} (${Math.round(topValue * 100)}%)`,
    width / 2,
    height - 50
  );
}

function drawBox(box) {
  //default is green detection box around face
  noFill();

  //observation= green
  if (state === 1) stroke(0, 255, 0);

  //misinterpreation=orange
  if (state === 2)
    stroke(
      frameCount % 135 < 118 ? color(255, 165, 0) : color(255, 165, 0, 50)
    );

  // escalaton =red
  if (state === 3)
    stroke(frameCount % 10 < 5 ? color(255, 0, 0) : color(255, 0, 0, 50));

  //breakdown = white
  if (state === 4) stroke(255);

  strokeWeight(4);
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
