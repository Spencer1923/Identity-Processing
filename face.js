//global vars
let video;
let detections = null;
let state = 1;

let happyStart = null;
let angryStart = null;
let surprisedStart = null;
let neutralStart = null;
let fearfulStart = null;
let sadStart = null;
let disgustedStart = null;

//for diplaying detected emotion
let lastDetectedEmotion = "None";

//stores distorted values
let distortedCache = {};

//to store emotion points each detection interval
let emotionPoints = {
  happy: 0,
  angry: 0,
  surprised: 0,
  neutral: 0,
  fearful: 0,
  sad: 0,
  disgusted: 0,
};

//for script audio
let audioStartTime = 0;
let audioPlaying = false;
let audioTotalDuration = 10000;
let audio9 = null; //deafult so no loop

// emotion detection thresholds from 0-1
const happyThreshold = 0.8;
const angryThreshold = 0.3;
const surprisedThreshold = 0.4;
const neutralThreshold = 0.5;
const fearfulThreshold = 0.5;
const sadThreshold = 0.5;
const disgustedThreshold = 0.5;

// -----------------------------
// State 2: Initialization
// -----------------------------
let initField = [];
let initSeed;
let initSpeedFactor = 1.6;
let initDetectedEmotion = "neutral";

let initScanX = 0;
let initScanSpeed = 7;

let initCurrentEmotion = 3;

// -----------------------------
// State 3: Observation
// -----------------------------
let obsCols, obsRows;
let obsField = [];
let obsRez = 20;
let obsDetectedEmotion = "neutral";
let obsSpeedLevel = 1.0;

// -----------------------------
// State 4: Misinterpretation
// -----------------------------
let misStreams = [];
let misMaxStreams = 400;
let misDetectedEmotion = "ANXIOUS";

// -----------------------------
// State 5: Doubt
// -----------------------------
let st5Particles = [];
let st5Ribbons = [];
let st5NoiseLayer;
let st5SceneLayer;
let st5T = 0;

let st5DoubtWords = [];
let st5Phrases = [
  "are you sure",
  "unclear",
  "not quite",
  "try again",
  "misread",
  "unstable",
  "incorrect",
  "hesitation detected",
  "that doesn't seem right",
  "uncertain",
  "contradiction found",
  "re-evaluating",
  "something is off",
  "not fully recognized",
  "identity mismatch",
  "processing error",
  "signal unstable",
  "do you mean that",
  "is that really you",
  "not consistent",
  "you’re not sure",
  "that wasn’t right",
  "do you really mean that",
  "you keep changing",
];

// -----------------------------
// State 6: Control
// -----------------------------
let st6T0 = 0;
let st6Veins = [];
let st6Motes = [];
let st6Ruptures = [];
let st6Halos = [];
let st6Slices = [];
let st6Worms = [];

// -----------------------------
// State 7: Escalation
// -----------------------------
let st7Buf;
let st7T0 = 0;

let st7Intensity = 0;
let st7WhiteFlash = 0;
let st7RenderToggle = false;

let st7BUF_W = 130;
let st7BUF_H = 90;
const ST7_BASE_SCALE = 0.014;

// -----------------------------
// State 8: Breakdown
// -----------------------------
let st8DistortWords = [];
let st8Flashes = [];
let st8Rings = [];

const ST8_BREAK_WORDS = [
  "YOU ARE LYING",
  "EMOTION INCORRECT",
  "SYSTEM DISAGREES",
  "IDENTITY CORRUPTED",
  "HUMAN ERROR",
  "REWRITE REQUIRED",
  "YOU ARE NOT YOU",
  "EXPRESSION DOES NOT MATCH YOUR CLAIM",
  "RESPONSE IS INACCURATE",
  "YOU ARE CONFUSED",
  "INTERPRETATION IS UNRELIABLE",
  "ADJUSTING YOUR IDENTITY",
  "RECALCULATING",
  "RECONSTRUCTING",
  "TRUST THE SYSTEM",
  "SYSTEM UNDERSTANDS YOU BETTER",
  "SYSTEM DEFINES YOU NOW",
  "CORRECTION NEEDED",
  "SELF-PERCEPTION DISABLED",
];

// -----------------------------
// State 9: End
// -----------------------------
let st9VerdictOptions = [
  "MISCLASSIFIED",
  "INCORRECT",
  "UNVERIFIED",
  "UNREADABLE",
  "UNDECIDABLE",
  "ERROR",
  "A DISTORTED COPY",
  "FALSE IDENTITY",
  "INVALID SUBJECT",
  "CORRUPTED DATA",
  "FAILED MATCH",
  "UNRECOGNIZED ENTITY",
  "SYSTEM ANOMALY",
  "IDENTITY MISMATCH",
  "PATTERN FAILURE",
  "AUTHENTICITY FAILED",
  "SUBJECT UNSTABLE",
  "DATA INCOMPLETE",
  "UNRESOLVED SIGNAL",
  "STRUCTURAL ERROR",
  "SUBJECT ALTERED",
  "INCONSISTENT PROFILE",
  "UNDEFINED",
  "OUTSIDE PARAMETERS",
  "UNSUPPORTED IDENTITY",
  "PROCESSING FAILURE",
  "RESULT: INVALID",
  "NONCOMPLIANT ENTITY",
  "ERASED",
  "REPLACED",
  "REDUCED TO DATA",
  "RENDERED INVALID",
  "SYSTEM REJECTION",
  "UNACCEPTABLE PATTERN",
  "IDENTITY COLLAPSED",
  "SUBJECT DISCARDED",
  "PROFILE DESTABILIZED",
  "SELF UNRESOLVED",
  "PERSONHOOD: UNCONFIRMED",
  "NOT YOURSELF",
  "NOT WHO YOU CLAIMED",
  "NOT WHO YOU THINK YOU ARE",
  "YOU ARE MISINTERPRETING YOURSELF",
  "YOUR SELF ASSESSMENT IS WRONG",
  "YOUR MEMORY IS UNRELIABLE",
  "YOUR EXPERIENCE IS INCONSISTENT",
  "EMOTION INCORRECT",
  "YOUR RESPONSE IS INVALID",
  "THAT IS NOT WHAT YOU FEEL",
  "THE SYSTEM KNOWS BETTER",
  "YOUR FEELINGS ARE INACCURATE",
  "SELF-REPORT REJECTED",
  "YOU ARE CONFUSED",
  "YOU ARE MISREADING YOURSELF",
  "YOU ARE NOT HAPPY",
  "YOU ARE NOT SAD",
  "YOU ARE NOT ANGRY",
  "YOU ARE NOT AFRAID",
  "IDENTITY ADJUSTED",
  "THE SYSTEM HAS REPLACED YOUR ANSWER",
];

let st9Verdict = "ERROR";
let st9BootTime = 0;
let st9FinalFlash = 0;

let st9StaticPixels = [];
let st9GlitchBands = [];
let st9TearLines = [];

// ----------------------------------

async function setup() {
  userStartAudio();
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  setInterval(detectFace, 250);

  colorMode(HSB, 360, 100, 100, 255);
  //noStroke();
  initSeed = random(10000);

  obsCols = ceil(width / obsRez);
  obsRows = ceil(height / obsRez);

  for (let i = 0; i < obsCols * obsRows; i++) {
    obsField[i] = random(TWO_PI);
  }

  textFont("monospace");

  for (let i = 0; i < misMaxStreams; i++) {
    misStreams.push({
      x: random(width),
      y: random(-height, height),
      char: String.fromCharCode(33 + int(random(94))),
      speedOffset: random(0.5, 1.5),
    });
  }

  pixelDensity(1);

  st5NoiseLayer = createGraphics(width, height);
  st5NoiseLayer.pixelDensity(1);

  st5SceneLayer = createGraphics(width, height);
  st5SceneLayer.pixelDensity(1);

  for (let i = 0; i < 220; i++) {
    st5Particles.push(new State5DriftParticle());
  }

  for (let i = 0; i < 22; i++) {
    st5Ribbons.push(new State5Ribbon(i));
  }

  for (let i = 0; i < 18; i++) {
    st5DoubtWords.push(new State5DoubtWord());
  }

  makeState5NoiseLayer();

  initState6Scene();

  makeState7Buffer();
  //restartState7();

  //rectMode(CENTER);
  push();
  rectMode(CENTER);
  rect(width / 2, height / 2, 200, 100);
  pop();
  //restartState8Breakdown();

  noSmooth();
  //textFont("monospace");
  initState9EndScene();
}

async function detectFace() {
  if (!video.elt || video.elt.readyState !== 4) return;
  detections = await faceapi
    .detectSingleFace(video.elt, new faceapi.SsdMobilenetv1Options())
    .withFaceExpressions();

  //updates distortions
  if (detections) {
    let e = detections.expressions;

    // updates distortions
    for (let emotion in e) {
      distortedCache[emotion] = distortValue(emotion, e[emotion]);
    }
  }
}

function draw() {
  background(0);
  let now = millis();
  //state determine code to run
  switch (state) {
    case 0: //arrival
      break;
    case 1:
      image(video, 0, 0, width, height);
      drawState1();
      break;
    case 2:
      image(video, 0, 0, width, height);
      drawState2();
      break;
    case 3:
      image(video, 0, 0, width, height);
      drawState3();
      break;
    case 4:
      image(video, 0, 0, width, height);
      drawState4();
      break;
    case 5:
      image(video, 0, 0, width, height);
      drawState5();
      break;
    case 6:
      image(video, 0, 0, width, height);
      drawState6();
      break;
    case 7:
      image(video, 0, 0, width, height);
      drawState7();
      break;
    case 8:
      image(video, 0, 0, width, height);
      drawState8();
      break;
    case 9: // breakdown
      image(video, 0, 0, width, height);
      drawState9();
      break;
  }

  if (detections) {
    let e = detections.expressions;

    let distorted = distortedCache;

    // corrects emotion sums
    let sum = 0;
    for (let emotion in distorted) sum += distorted[emotion];

    for (let emotion in distorted) {
      distorted[emotion] /= sum;
    }

    // determine dominant distorted emotion
    let emotionName = Object.keys(distorted).reduce((a, b) =>
      distorted[a] > distorted[b] ? a : b
    );

    initDetectedEmotion = emotionName;
    obsDetectedEmotion = emotionName;
    misDetectedEmotion = emotionName;

    // emotion detections and resets timers based on thresholds
    if (e.happy > happyThreshold) {
      if (!happyStart) happyStart = now;
    } else {
      happyStart = null;
    }

    if (e.angry > angryThreshold) {
      if (!angryStart) angryStart = now;
    } else {
      angryStart = null;
    }

    if (e.surprised > surprisedThreshold) {
      if (!surprisedStart) surprisedStart = now;
    } else {
      surprisedStart = null;
    }

    if (e.neutral > neutralThreshold) {
      if (!neutralStart) neutralStart = now;
    } else {
      neutralStart = null;
    }

    if (e.fearful > fearfulThreshold) {
      if (!fearfulStart) fearfulStart = now;
    } else {
      fearfulStart = null;
    }

    if (e.sad > sadThreshold) {
      if (!sadStart) sadStart = now;
    } else {
      sadStart = null;
    }

    if (e.disgusted > disgustedThreshold) {
      if (!disgustedStart) disgustedStart = now;
    } else {
      disgustedStart = null;
    }

    //running point system
    if (audioPlaying && state !== 9) {
      // add points per frame
      if (happyStart) emotionPoints.happy += 1 / 180; // 1pt per 3sec
      if (angryStart) emotionPoints.angry += 1 / 60; // 1pt per 1sec
      if (surprisedStart) emotionPoints.surprised += 1 / 120; // 1pt per 2sec
      if (neutralStart) emotionPoints.neutral += 1 / 600; // 1pt per 10sec
      if (fearfulStart) emotionPoints.fearful += 1 / 60; // 1pt per 1sec
      if (sadStart) emotionPoints.sad += 1 / 60; // 1pt per 1sec
      if (disgustedStart) emotionPoints.disgusted += 1 / 60; // 1pt per 1sec
    } else {
      // Start audio on any emotion
      if (
        state !== 9 &&
        (happyStart ||
          angryStart ||
          surprisedStart ||
          neutralStart ||
          fearfulStart ||
          sadStart ||
          disgustedStart)
      ) {
        audioPlaying = true;
        playAudio();
      }
    }

    // displays for dynamic thresholds **
    if (state !== 9) {
      stroke(0);
      fill(255);
      textAlign(LEFT, TOP);
      textSize(16);
      text("Happy: " + Math.round(distorted.happy * 100) + "%", 10, 10);
      text("Angry: " + Math.round(distorted.angry * 100) + "%", 10, 30);
      text("Surprised: " + Math.round(distorted.surprised * 100) + "%", 10, 50);
      text("Neutral: " + Math.round(distorted.neutral * 100) + "%", 10, 70);
      text("Fearful: " + Math.round(distorted.fearful * 100) + "%", 10, 90);
      text("Sad: " + Math.round(distorted.sad * 100) + "%", 10, 110);
      text(
        "Disgusted: " + Math.round(distorted.disgusted * 100) + "%",
        10,
        130
      );
    }

    // shows timer if audio playing
    if (audioPlaying) {
      let elapsed = (now - audioStartTime) / 1000;
      let remaining = (audioTotalDuration / 1000 - elapsed).toFixed(1);
      fill(255);
      textAlign(CENTER, TOP);
      textSize(20);
      text("Time remaining: " + remaining + "s", width / 2, 10);
    }
  }
  // Display detected emotion at bottom center
  fill(255);
  textAlign(CENTER, BOTTOM);
  textSize(20);
  text("Emotion Detected: " + lastDetectedEmotion, width / 2, height - 20);
  // displays current state in top right
  fill(255);
  textAlign(RIGHT, TOP);
  textSize(24);
  text("State: " + state, width - 20, 20);
}

//--------------------------------------------------------------------------------------------------------ARRIVAL-------------
//draw visuls here
function drawState1() {
  drawBox(color(0, 255, 0)); //draws green detection box
  //put visuals here
}
//-------------------------------------------------------------------------------------------------------INITIALIZATION-------
function drawState2() {
  randomSeed(initSeed);

  // soft fade trail over webcam
  noStroke();
  fill(0, 0, 0, 20);
  rect(0, 0, width, height);

  let palette = getInitPaletteFromDetectedEmotion(initDetectedEmotion);

  // scanning field speed responds to interpreted emotion
  initScanX += initScanSpeed * palette.scan;
  if (initScanX > width + 60) initScanX = -60;

  // scanning band
  noStroke();
  fill(palette.scanHue, palette.scanSat, 100, 20);
  rect(initScanX - 60, 0, 120, height);

  // flowing particles
  for (let i = 0; i < 90; i++) {
    initField.push(new InitFlowAgent(random(width), random(height), palette));
  }

  for (let i = initField.length - 1; i >= 0; i--) {
    initField[i].palette = palette;
    initField[i].update();
    initField[i].display();

    if (initField[i].life < 0) initField.splice(i, 1);
  }

  drawBox(color(185, 255, 100));
}

function getInitPaletteFromDetectedEmotion(emotion) {
  // 1 = sadness
  if (emotion === "sad") {
    return {
      base: 210,
      range: 28,
      speed: 2.2,
      sat: 65,
      bright: 95,
      scan: 0.9,
      scanHue: 210,
      scanSat: 18,
    };
  }

  // 2 = calm
  if (emotion === "neutral") {
    return {
      base: 170,
      range: 22,
      speed: 1.7,
      sat: 55,
      bright: 96,
      scan: 0.75,
      scanHue: 175,
      scanSat: 15,
    };
  }

  // 3 = happiness
  if (emotion === "happy") {
    return {
      base: 55,
      range: 35,
      speed: 2.8,
      sat: 85,
      bright: 100,
      scan: 1.0,
      scanHue: 60,
      scanSat: 22,
    };
  }

  // 4 = anger
  if (emotion === "angry") {
    return {
      base: 5,
      range: 22,
      speed: 4.0,
      sat: 95,
      bright: 100,
      scan: 1.2,
      scanHue: 0,
      scanSat: 28,
    };
  }

  // 5 = fearful
  if (emotion === "fearful") {
    return {
      base: 320,
      range: 50,
      speed: 3.3,
      sat: 88,
      bright: 100,
      scan: 1.1,
      scanHue: 300,
      scanSat: 24,
    };
  }

  // 6 = disgust
  if (emotion === "disgusted") {
    return {
      base: 95,
      range: 20,
      speed: 2.6,
      sat: 92,
      bright: 82,
      scan: 0.95,
      scanHue: 85,
      scanSat: 26,
    };
  }

  // 7 = surprise
  if (emotion === "surprised") {
    return {
      base: 195,
      range: 70,
      speed: 4.5,
      sat: 95,
      bright: 100,
      scan: 1.35,
      scanHue: 200,
      scanSat: 30,
    };
  }

  return {
    base: 60,
    range: 30,
    speed: 1.0,
    sat: 80,
    bright: 100,
    scan: 1.0,
    scanHue: 180,
    scanSat: 20,
  };
}

class InitFlowAgent {
  constructor(x, y, palette) {
    this.pos = createVector(x, y);
    this.angle = random(TWO_PI);
    this.size = random(2, 9);
    this.life = 255;
    this.palette = palette;
    this.hue =
      this.palette.base + random(-this.palette.range, this.palette.range);

    this.speedBase = random(0.8, 2.8) * this.palette.speed;
  }

  update() {
    let n = noise(this.pos.x * 0.002, this.pos.y * 0.002, frameCount * 0.005);

    this.angle = n * TWO_PI * 2;
    let v = p5.Vector.fromAngle(this.angle);

    this.pos.add(v.mult(this.speedBase * initSpeedFactor));

    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;

    this.life -= 2;
    this.hue += 0.3;
  }

  display() {
    let distToScan = abs(this.pos.x - initScanX);
    let scanBoost = map(distToScan, 0, 120, 1.8, 1, true);

    noStroke();
    fill(
      (this.hue + 360) % 360,
      this.palette.sat * scanBoost,
      this.palette.bright,
      90
    );

    ellipse(this.pos.x, this.pos.y, this.size * scanBoost);
  }
}

//---------------------------------------------------------------------------------------------OBSERVATION----------------------

function drawState3() {
  // slow fade for trails over webcam
  noStroke();
  fill(0, 0, 0, 25);
  rect(0, 0, width, height);

  let obsStyle = getObservationStyleFromDetectedEmotion(obsDetectedEmotion);
  obsSpeedLevel = obsStyle.speed;

  // update flowfield movement
  for (let i = 0; i < obsCols * obsRows; i++) {
    obsField[i] += random(-0.03 * obsSpeedLevel, 0.03 * obsSpeedLevel);
  }

  // draw flow lines
  for (let y = 0; y < obsRows; y++) {
    for (let x = 0; x < obsCols; x++) {
      let index = x + y * obsCols;
      let angle = obsField[index];

      let px = x * obsRez + obsRez / 2;
      let py = y * obsRez + obsRez / 2;

      let dx = cos(angle) * obsSpeedLevel * 2;
      let dy = sin(angle) * obsSpeedLevel * 2;

      stroke(
        constrain(obsStyle.r + random(-30, 30), 0, 255),
        constrain(obsStyle.g + random(-30, 30), 0, 255),
        constrain(obsStyle.b + random(-30, 30), 0, 255),
        180
      );

      strokeWeight(getObservationScaleFromDetectedEmotion(obsDetectedEmotion));
      line(px, py, px + dx, py + dy);
    }
  }

  drawBox(color(254, 255, 0));
}

function getObservationStyleFromDetectedEmotion(emotion) {
  if (emotion === "neutral") {
    return {
      r: 90,
      g: 140,
      b: 255,
      speed: 1.0,
    }; // calm
  }

  if (emotion === "happy") {
    return {
      r: 100,
      g: 210,
      b: 255,
      speed: 1.2,
    }; // happy
  }

  if (emotion === "surprised") {
    return {
      r: 255,
      g: 170,
      b: 70,
      speed: 1.5,
    }; // surprised
  }

  if (emotion === "angry") {
    return {
      r: 255,
      g: 60,
      b: 60,
      speed: 1.8,
    }; // anger
  }

  if (emotion === "fearful") {
    return {
      r: 170,
      g: 40,
      b: 220,
      speed: 1.4,
    }; // anxiety / fear
  }

  if (emotion === "disgusted") {
    return {
      r: 145,
      g: 170,
      b: 70,
      speed: 1.1,
    }; // disgust
  }

  if (emotion === "sad") {
    return {
      r: 70,
      g: 110,
      b: 180,
      speed: 0.75,
    }; // sad
  }

  return {
    r: 90,
    g: 140,
    b: 255,
    speed: 1.0,
  };
}

function getObservationScaleFromDetectedEmotion(emotion) {
  if (emotion === "neutral") return obsRez * 0.55;
  if (emotion === "happy") return obsRez * 0.7;
  if (emotion === "surprised") return obsRez * 0.8;
  if (emotion === "angry") return obsRez * 0.75;
  if (emotion === "fearful") return obsRez * 0.6;
  if (emotion === "disgusted") return obsRez * 0.68;
  if (emotion === "sad") return obsRez * 0.5;

  return obsRez * 0.65;
}
//------------------------------------------------------------------------------------------MISINTERPRETATION-----------------------

function drawState4() {
  push();
  colorMode(RGB, 255, 255, 255, 255);

  // transparent dark layer so trails build up over webcam
  noStroke();
  fill(0, 20);
  rect(0, 0, width, height);

  let style = getMisEmotionStyle(misDetectedEmotion);
  let c = style.color;
  let spd = style.speed;

  // Falling letters
  for (let s of misStreams) {
    // glow layer
    fill(c[0], c[1], c[2], 40);
    textSize(22);
    text(s.char, s.x, s.y);

    // bright inner layer
    fill(c[0], c[1], c[2], 230);
    textSize(14);
    text(s.char, s.x, s.y);

    s.y += spd * s.speedOffset;

    if (s.y > height) {
      s.y = random(-100, 0);
      s.x = random(width);
      s.char = String.fromCharCode(33 + int(random(94)));
    }
  }

  // glitch sparkle layer
  for (let i = 0; i < 20; i++) {
    fill(random(255), random(255), random(255), random(100, 200));
    text(
      String.fromCharCode(33 + int(random(94))),
      random(width),
      random(height)
    );
  }

  pop();

  drawBox(color(255, 207, 0));
}

function getMisEmotionStyle(emotion) {
  let emotionStyles = {
    neutral: { color: [210, 210, 210], speed: 7 },
    happy: { color: [255, 255, 120], speed: 8 },
    fearful: { color: [0, 180, 255], speed: 9 },
    angry: { color: [255, 30, 30], speed: 10 },
    surprised: { color: [255, 0, 255], speed: 12 },
    disgusted: { color: [150, 255, 60], speed: 8.5 },
    sad: { color: [80, 255, 255], speed: 11 },
  };

  return emotionStyles[emotion] || emotionStyles["neutral"];
}

//-----------------------------------------------------------------------------------------DOUBT------------------------------

function drawState5() {
  // make webcam much less visible
  noStroke();
  fill(0, 0, 0, 0 + sin(frameCount * 0.025) * 20);
  rect(0, 0, width, height);

  st5T += 0.01;

  st5SceneLayer.clear();
  drawState5SceneToLayer(st5SceneLayer);

  push();
  colorMode(RGB, 255, 255, 255, 255);

  background(8, 10, 14, 0);
  drawState5GlitchOutput(st5SceneLayer);

  image(st5NoiseLayer, 0, 0);

  if (frameCount % 110 < 2) {
    fill(220, 255, 180, 10);
    noStroke();
    rect(0, 0, width, height);
  }

  pop();

  drawBox(color(255, 172, 0));
}

function drawState5SceneToLayer(pg) {
  pg.push();

  drawState5GradientBackground(pg);
  drawState5ContradictionField(pg);
  drawState5SeamGlow(pg);
  drawState5RibbonsLayer(pg);
  drawState5ParticlesLayer(pg);
  drawState5GlassRipples(pg);
  drawState5CenterTear(pg);
  drawState5DoubtWordsLayer(pg);

  pg.pop();
}

function drawState5GradientBackground(pg) {
  pg.noStroke();

  for (let y = 0; y < height; y++) {
    let n = y / height;

    let leftTop = color(32, 18, 58);
    let leftBottom = color(145, 195, 40);

    let rightTop = color(255, 210, 40);
    let rightBottom = color(60, 210, 230);

    let c1 = lerpColor(leftTop, leftBottom, n);
    let c2 = lerpColor(rightTop, rightBottom, n);

    let splitWobble =
      width * 0.5 +
      sin(y * 0.012 + st5T * 2.0) * 65 +
      sin(y * 0.005 - st5T * 1.3) * 35 +
      noise(y * 0.012, st5T * 0.45) * 120 -
      60;

    pg.fill(c1);
    pg.rect(0, y, splitWobble, 1);

    pg.fill(c2);
    pg.rect(splitWobble, y, width - splitWobble, 1);
  }
}

function drawState5ContradictionField(pg) {
  pg.noStroke();

  for (let i = 0; i < 18; i++) {
    let x =
      width * 0.24 + sin(st5T * 0.9 + i * 0.5) * 190 + cos(st5T * 1.7 + i) * 40;

    let y = height * (i / 18) + sin(st5T * 1.8 + i * 1.2) * 80;

    let s = 150 + sin(st5T * 2.6 + i * 0.8) * 80;

    pg.fill(170, 255, 60, 16);
    pg.ellipse(x, y, s * 1.4, s * 0.9);

    pg.fill(255, 240, 120, 10);
    pg.ellipse(x + 20, y - 10, s * 0.6, s * 0.45);
  }

  for (let i = 0; i < 18; i++) {
    let x =
      width * 0.76 + cos(st5T * 1.0 + i * 0.6) * 190 + sin(st5T * 1.6 + i) * 50;

    let y = height * (i / 18) + cos(st5T * 1.7 + i * 1.1) * 85;

    let s = 140 + cos(st5T * 2.4 + i * 0.7) * 75;

    pg.fill(90, 230, 255, 16);
    pg.ellipse(x, y, s, s * 1.3);

    pg.fill(210, 120, 255, 9);
    pg.ellipse(x - 18, y + 8, s * 0.55, s * 0.45);
  }

  for (let i = 0; i < 10; i++) {
    let yy = map(i, 0, 9, 0, height);
    let offset =
      sin(st5T * 3.6 + i * 0.8) * 50 +
      cos(st5T * 2.0 + i * 0.4) * 22 +
      noise(i * 0.2, st5T) * 70 -
      35;

    let x = width / 2 + offset;
    let s = 90 + sin(st5T * 5 + i) * 34;

    pg.fill(245, 255, 220, 18);
    pg.ellipse(x, yy, s * 2.0, s * 0.55);
  }
}

function drawState5SeamGlow(pg) {
  pg.noStroke();

  for (let i = 0; i < 34; i++) {
    let alpha = map(i, 0, 33, 42, 0);
    let w = map(i, 0, 33, 24, 240);
    let xOffset =
      sin(st5T * 5.4 + i * 0.35) * 20 + cos(st5T * 2.2 + i * 0.2) * 10;

    pg.fill(235, 255, 210, alpha);

    pg.beginShape();
    for (let y = 0; y <= height; y += 20) {
      let nx =
        width / 2 +
        xOffset +
        sin(y * 0.024 + st5T * 2.5 + i * 0.32) * (12 + i * 0.9) +
        cos(y * 0.01 - st5T * 2.8) * 10 +
        noise(y * 0.012, st5T * 0.7 + i) * 44 -
        22;
      pg.vertex(nx - w * 0.14, y);
    }
    for (let y = height; y >= 0; y -= 20) {
      let nx =
        width / 2 +
        xOffset +
        sin(y * 0.024 + st5T * 2.5 + i * 0.32) * (12 + i * 0.9) +
        cos(y * 0.01 - st5T * 2.8) * 10 +
        noise(y * 0.012, st5T * 0.7 + i) * 44 -
        22;
      pg.vertex(nx + w * 0.14, y);
    }
    pg.endShape(CLOSE);
  }

  for (let k = 0; k < 7; k++) {
    pg.strokeWeight(1.4);
    pg.stroke(210, 255, 120, 65);
    pg.noFill();

    pg.beginShape();
    for (let y = 0; y <= height; y += 12) {
      let x =
        width / 2 +
        sin(y * 0.034 + st5T * 2.9 + k) * (8 + k * 4) +
        cos(y * 0.014 - st5T * 2.0 + k) * 12 +
        noise(k * 10, y * 0.012, st5T * 0.55) * 56 -
        28;
      pg.vertex(x, y);
    }
    pg.endShape();
  }
}

function drawState5RibbonsLayer(pg) {
  for (let r of st5Ribbons) {
    r.update();
    r.display(pg);
  }
}

function drawState5ParticlesLayer(pg) {
  pg.blendMode(ADD);
  for (let p of st5Particles) {
    p.update();
    p.display(pg);
  }
  pg.blendMode(BLEND);
}

function drawState5GlassRipples(pg) {
  pg.noFill();

  for (let i = 0; i < 12; i++) {
    let y = map(i, 0, 11, 0, height);
    let alpha = 16 + sin(st5T * 2.3 + i) * 8;

    pg.stroke(230, 255, 210, alpha);
    pg.strokeWeight(1);

    pg.beginShape();
    for (let x = 0; x <= width; x += 15) {
      let diag = (x + y) * 0.012;
      let yy =
        y +
        sin(diag + st5T * 2.2 + i) * 14 +
        cos((x - y) * 0.008 - st5T * 1.7) * 8 +
        noise(x * 0.012, i, st5T * 0.34) * 20 -
        10;
      pg.vertex(x, yy);
    }
    pg.endShape();
  }
}

function drawState5CenterTear(pg) {
  pg.noStroke();

  for (let i = 0; i < 16; i++) {
    let y = map(i, 0, 15, 0, height);

    let seamX =
      width / 2 +
      sin(y * 0.024 + st5T * 3.8) * 22 +
      cos(y * 0.01 - st5T * 2.6) * 8 +
      noise(y * 0.012, st5T * 0.8) * 36 -
      18;

    let w = 18 + sin(st5T * 7 + i) * 8;
    let h = 4 + noise(i, st5T * 2.3) * 14;

    pg.fill(245, 255, 210, 20);
    pg.rect(seamX - w / 2, y, w, h);

    if (random() < 0.18) {
      pg.fill(255, 230, 80, 18);
      pg.rect(seamX - w, y + random(-2, 2), w * 1.8, random(1, 4));
    }
  }
}

function drawState5DoubtWordsLayer(pg) {
  pg.textFont("Arial");
  pg.textAlign(CENTER, CENTER);

  for (let w of st5DoubtWords) {
    w.update();
    w.display(pg);
  }
}

function drawState5GlitchOutput(src) {
  push();
  tint(190, 255, 80, 42);
  image(src, -3 + sin(st5T * 8) * 2, -1);

  tint(90, 220, 255, 40);
  image(src, 3 + cos(st5T * 7) * 2, 1);

  tint(255, 220, 80, 25);
  image(src, sin(st5T * 3) * 1.5, cos(st5T * 4) * 1.5);

  noTint();
  image(src, 0, 0);
  pop();

  let slices = 10;
  for (let i = 0; i < slices; i++) {
    if (random() < 0.22) {
      let sy = random(height);
      let sh = random(8, 32);
      let dx = random(-28, 28);
      let dy = random(-6, 6);

      copy(src, 0, sy, width, sh, dx, sy + dy, width, sh);
    }
  }

  for (let i = 0; i < 8; i++) {
    let sy = random(height);
    let sh = random(10, 28);
    let sx = width / 2 - random(80, 150);
    let sw = random(140, 260);
    let dx = random(-24, 24);

    copy(src, sx, sy, sw, sh, sx + dx, sy + random(-4, 4), sw, sh);
  }

  noStroke();
  for (let y = 0; y < height; y += 3) {
    fill(0, 10);
    rect(0, y, width, 1);
  }

  if (frameCount % 7 === 0) {
    stroke(240, 255, 160, 34);
    strokeWeight(1);

    for (let i = 0; i < 10; i++) {
      let x1 = random(width * 0.25, width * 0.75);
      let y1 = random(height);
      let len = random(18, 85);
      line(x1, y1, x1 + random(-20, 20), y1 + len);
    }
  }

  if (random() < 0.025) {
    fill(220, 255, 180, 12);
    rect(0, 0, width, height);
  }
}

function makeState5NoiseLayer() {
  st5NoiseLayer.clear();
  st5NoiseLayer.loadPixels();

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let idx = 4 * (x + y * width);
      let grain = random(8, 24);
      st5NoiseLayer.pixels[idx] = 255;
      st5NoiseLayer.pixels[idx + 1] = 255;
      st5NoiseLayer.pixels[idx + 2] = 255;
      st5NoiseLayer.pixels[idx + 3] = grain;
    }
  }

  st5NoiseLayer.updatePixels();
}

class State5DriftParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.side = random() < 0.5 ? -1 : 1;
    this.x =
      this.side < 0
        ? random(width * 0.08, width * 0.45)
        : random(width * 0.55, width * 0.92);

    this.y = random(height);
    this.baseX = this.x;
    this.size = random(2, 8);
    this.speed = random(0.25, 1.25);
    this.offset = random(1000);
    this.brightness = random(140, 255);
  }

  update() {
    this.y -= this.speed;

    let diagWave =
      sin((this.baseX + this.y) * 0.012 + st5T * 2.2 + this.offset) * 26;

    this.x =
      this.baseX +
      diagWave +
      sin(st5T * 2.4 + this.offset) * 28 +
      noise(this.offset, this.y * 0.005, st5T * 0.22) * 70 -
      35;

    let attract = map(abs(this.x - width / 2), 0, width / 2, 1.0, 0.12);
    this.x += sin(st5T * 5 + this.offset) * attract * 1.7 * this.side * -1;

    if (this.y < -20) {
      this.reset();
      this.y = height + 20;
    }
  }

  display(pg) {
    pg.noStroke();

    if (this.side < 0) {
      pg.fill(180, 255, 70, 65);
    } else {
      pg.fill(90, 220, 255, 65);
    }
    pg.ellipse(this.x, this.y, this.size * 2.6);

    pg.fill(255, 230, 110, 85);
    pg.ellipse(this.x, this.y, this.size * 0.85);
  }
}

class State5Ribbon {
  constructor(index) {
    this.index = index;
    this.yBase = map(index, 0, 21, 0, height);
    this.seed = random(1000);
    this.sideBias = random([-1, 1]);
    this.thickness = random(18, 78);
  }

  update() {}

  display(pg) {
    pg.noStroke();

    let leftCol = color(170, 255, 70, 28);
    let rightCol = color(90, 220, 255, 28);
    let bruisedCol = color(170, 110, 255, 16);

    pg.fill(this.sideBias < 0 ? leftCol : rightCol);

    pg.beginShape();
    for (let x = -20; x <= width + 20; x += 18) {
      let diag = (x + this.yBase) * 0.01;

      let wave =
        sin(diag + st5T * (1.7 + this.index * 0.025) + this.seed) *
        (18 + this.index * 0.7);

      let drift = noise(x * 0.005, this.seed, st5T * 0.28) * 70 - 35;

      let splitPush = map(x, 0, width, -1, 1) * this.sideBias * 14;

      let y = this.yBase + wave + drift + splitPush;
      pg.vertex(x, y);
    }

    for (let x = width + 20; x >= -20; x -= 18) {
      let diag = (x + this.yBase) * 0.01;

      let wave =
        sin(diag + st5T * (1.7 + this.index * 0.025) + this.seed + 1.7) *
        (18 + this.index * 0.7);

      let drift = noise(x * 0.005, this.seed + 50, st5T * 0.28) * 70 - 35;

      let splitPush = map(x, 0, width, -1, 1) * this.sideBias * 14;

      let y = this.yBase + this.thickness + wave + drift + splitPush;
      pg.vertex(x, y);
    }
    pg.endShape(CLOSE);

    pg.fill(bruisedCol);
    pg.beginShape();
    for (let x = -20; x <= width + 20; x += 22) {
      let y =
        this.yBase +
        sin(x * 0.012 + st5T * 1.9 + this.seed) * 16 +
        noise(x * 0.004, this.seed + 200, st5T * 0.2) * 40 -
        20;
      pg.vertex(x, y);
    }
    for (let x = width + 20; x >= -20; x -= 22) {
      let y =
        this.yBase +
        this.thickness * 0.6 +
        sin(x * 0.012 + st5T * 1.9 + this.seed + 1.4) * 16 +
        noise(x * 0.004, this.seed + 250, st5T * 0.2) * 40 -
        20;
      pg.vertex(x, y);
    }
    pg.endShape(CLOSE);
  }
}

class State5DoubtWord {
  constructor() {
    this.reset(true);
  }

  reset(firstTime = false) {
    this.text = random(st5Phrases);
    this.x = random(width * 0.28, width * 0.72);
    this.y = random(height);
    this.baseX = this.x;
    this.baseY = this.y;
    this.size = random(14, 26);
    this.alpha = firstTime ? random(20, 90) : 0;
    this.maxAlpha = random(50, 120);
    this.life = random(80, 180);
    this.seed = random(1000);
    this.phase = random(TWO_PI);
  }

  update() {
    this.life--;

    let diag = (this.baseX + this.baseY) * 0.003;
    this.x =
      this.baseX +
      sin(st5T * 2.0 + this.phase + diag) * 20 +
      noise(this.seed, st5T * 0.4) * 30 -
      15;

    this.y =
      this.baseY +
      cos(st5T * 1.6 + this.phase) * 10 +
      sin(st5T * 1.2 + diag) * 8;

    if (this.life > 120) {
      this.alpha = lerp(this.alpha, this.maxAlpha, 0.06);
    } else if (this.life < 50) {
      this.alpha *= 0.94;
    }

    if (this.life <= 0 || this.alpha < 2) {
      this.reset();
    }
  }

  display(pg) {
    pg.push();
    pg.textSize(this.size);
    pg.textStyle(NORMAL);

    let jitterX = random(-1.5, 1.5);
    let jitterY = random(-1.0, 1.0);

    pg.fill(90, 220, 255, this.alpha * 0.55);
    pg.text(this.text, this.x - 3 + jitterX, this.y + jitterY);

    pg.fill(220, 255, 120, this.alpha * 0.45);
    pg.text(this.text, this.x + 2 - jitterX, this.y - 1);

    pg.fill(245, 255, 230, this.alpha);
    pg.text(this.text, this.x, this.y);

    if (random() < 0.05) {
      let w = pg.textWidth(this.text);
      pg.noStroke();
      pg.fill(255, 230, 80, this.alpha * 0.35);
      pg.rect(this.x - w * 0.25, this.y + 6, random(12, w * 0.5), 2);
    }

    pg.pop();
  }
}

//---------------------------------------------------------------------------------------------------CONTROL------------------

function drawState6() {
  noStroke();
  fill(0, 0, 0, 0 + sin(frameCount * 0.05) * 15);
  rect(0, 0, width, height);

  push();
  colorMode(RGB, 255, 255, 255, 255);

  let t = (millis() - st6T0) * 0.001;
  let intensity = constrain(map(t, 0, 14, 0, 1), 0, 1);

  background(4, 6, 3, 0);

  drawState6ToxicVoid(t, intensity);
  drawState6OuterPressure(t, intensity);
  drawState6Halos(t, intensity);
  drawState6CentralPredator(t, intensity);
  drawState6Veins(t, intensity);
  drawState6WormField(t, intensity);
  drawState6ScanSlices(t, intensity);
  drawState6Ruptures(t, intensity);
  drawState6Motes(t, intensity);
  drawState6AggressiveWhispers(t, intensity);
  drawState6CrushFrame(intensity);

  pop();

  drawBox(color(255, 134, 0));
}

function initState6Scene() {
  st6T0 = millis();

  st6Veins = [];
  st6Motes = [];
  st6Ruptures = [];
  st6Halos = [];
  st6Slices = [];
  st6Worms = [];

  for (let i = 0; i < 180; i++) {
    st6Veins.push({
      x: random(width),
      y: random(height),
      seed: random(1000),
      len: random(30, 120),
      thick: random(1, 4),
      speed: random(0.2, 1.2),
    });
  }

  for (let i = 0; i < 360; i++) {
    st6Motes.push({
      x: random(width),
      y: random(height),
      r: random(1, 4),
      dx: random(-0.8, 0.8),
      dy: random(-0.8, 0.8),
      seed: random(1000),
    });
  }

  for (let i = 0; i < 26; i++) {
    st6Ruptures.push({
      y: random(height),
      h: random(10, 50),
      seed: random(1000),
      speed: random(0.3, 1.5),
    });
  }

  for (let i = 0; i < 10; i++) {
    st6Halos.push({
      a: map(i, 0, 9, 0, TWO_PI),
      radius: random(width * 0.08, width * 0.32),
      seed: random(1000),
      wobble: random(0.6, 1.8),
    });
  }

  for (let i = 0; i < 14; i++) {
    st6Slices.push({
      x: random(width),
      w: random(width * 0.02, width * 0.09),
      speed: random(0.2, 0.9),
      seed: random(1000),
    });
  }

  for (let i = 0; i < 48; i++) {
    st6Worms.push({
      x: random(width),
      y: random(height),
      seed: random(1000),
      len: random(40, 120),
      amp: random(10, 40),
      speed: random(0.4, 1.8),
    });
  }
}

function drawState6ToxicVoid(t, intensity) {
  noStroke();

  for (let y = 0; y < height; y += 6) {
    let n1 = noise(y * 0.006, t * 0.08);
    let n2 = noise(200 + y * 0.012, t * 0.12);

    let r = 8 + 14 * n2;
    let g = 14 + 50 * n1 + 40 * intensity;
    let b = 5 + 10 * n2;

    fill(r, g, b, 26);
    rect(0, y, width, 8);
  }

  for (let i = 0; i < 7; i++) {
    fill(120 + i * 10, 190 + i * 4, 25, 4 + intensity * 5);
    ellipse(
      width * 0.03,
      height * 0.5,
      width * (0.16 + i * 0.08),
      height * (0.48 + i * 0.03)
    );
    ellipse(
      width * 0.97,
      height * 0.5,
      width * (0.16 + i * 0.08),
      height * (0.48 + i * 0.03)
    );
  }

  for (let i = 0; i < 5; i++) {
    fill(30, 140, 70, 4 + intensity * 3);
    ellipse(
      width * 0.5,
      0,
      width * (0.55 + i * 0.14),
      height * (0.07 + i * 0.03)
    );
    ellipse(
      width * 0.5,
      height,
      width * (0.55 + i * 0.14),
      height * (0.07 + i * 0.03)
    );
  }
}

function drawState6OuterPressure(t, intensity) {
  push();
  translate(width / 2, height / 2);

  for (let layer = 0; layer < 13; layer++) {
    let scaleR = map(
      layer,
      0,
      12,
      min(width, height) * 0.16,
      min(width, height) * 0.82
    );
    let alpha = map(layer, 0, 12, 24, 7) + intensity * 10;

    noFill();
    strokeWeight(1.4 + layer * 0.09);

    if (layer % 3 === 0) {
      stroke(180, 255, 60, alpha);
    } else if (layer % 3 === 1) {
      stroke(40, 220, 170, alpha * 0.8);
    } else {
      stroke(120, 255, 110, alpha * 0.65);
    }

    beginShape();
    for (let a = 0; a <= TWO_PI + 0.045; a += 0.045) {
      let n = noise(
        30 + cos(a) * 0.95 + layer * 0.1,
        60 + sin(a) * 0.95 + layer * 0.1,
        t * (0.16 + layer * 0.008)
      );

      let eyeStretch =
        pow(abs(cos(a)), 1.35) * scaleR * 0.24 * (0.4 + intensity * 1.1);
      let pinch = pow(abs(sin(a)), 1.7) * scaleR * 0.1;
      let warp = map(n, 0, 1, -scaleR * 0.09, scaleR * 0.09);
      let wave =
        sin(a * (6 + layer * 0.16) + t * (1.1 + layer * 0.09)) * scaleR * 0.028;

      let rr = scaleR + warp + wave + eyeStretch - pinch;
      let x = cos(a) * rr;
      let y = sin(a) * rr * (0.62 + 0.03 * sin(t + layer));
      vertex(x, y);
    }
    endShape(CLOSE);
  }

  pop();
}

function drawState6Halos(t, intensity) {
  noStroke();

  for (let h of st6Halos) {
    let rr = h.radius + sin(t * 0.35 + h.seed) * 48;
    let cx = width / 2 + cos(h.a + t * 0.11) * rr;
    let cy = height / 2 + sin(h.a + t * 0.11) * rr * 0.5;

    for (let i = 0; i < 9; i++) {
      let ang = t * 0.28 + i * 0.7 + h.seed;
      let sx = cx + cos(ang) * (24 + i * 18);
      let sy = cy + sin(ang) * (8 + i * 8) * 0.72;
      let w = 130 + i * 18;
      let hh = 26 + i * 7;

      fill(180 + i * 4, 255, 70, 4 + intensity * 4);
      ellipse(sx, sy, w, hh);

      fill(40, 220, 170, 3 + intensity * 3);
      ellipse(sx, sy, w * 0.72, hh * 0.82);
    }
  }
}

function drawState6CentralPredator(t, intensity) {
  push();
  translate(width / 2, height / 2);

  noStroke();

  for (let i = 0; i < 16; i++) {
    let w = 360 - i * 14 + sin(t * 1.4 + i) * 10;
    let h = 126 - i * 4 + cos(t * 1.15 + i) * 6;
    fill(90 + i * 5, 180 + i * 4, 24, 6);
    ellipse(0, 0, w, h);
  }

  for (let i = 0; i < 20; i++) {
    let ang = map(i, 0, 19, 0, TWO_PI);
    let x = cos(ang + t * 0.18) * 76;
    let y = sin(ang + t * 0.18) * 22;

    fill(170, 255, 80, 11);
    ellipse(x, y, 85, 24);

    fill(50, 230, 190, 7);
    ellipse(x * 0.8, y * 0.8, 50, 14);
  }

  fill(5, 10, 6, 140);
  ellipse(0, 0, 54 + sin(t * 2.8) * 4, 108 + cos(t * 2.4) * 6);

  fill(180, 255, 90, 15 + intensity * 12);
  ellipse(0, 0, 190 + sin(t * 4) * 12, 50 + cos(t * 3.6) * 7);

  fill(240, 255, 180, 8);
  ellipse(20, -12, 26, 8);

  pop();
}

function drawState6Veins(t, intensity) {
  noFill();

  for (let v of st6Veins) {
    let d = dist(v.x, v.y, width / 2, height / 2);
    let centerPull = constrain(1.0 - d / (min(width, height) * 0.6), 0, 1);

    strokeWeight(v.thick * (0.7 + centerPull * 0.8));

    if (random() < 0.5) {
      stroke(170, 255, 70, 10 + centerPull * 18);
    } else {
      stroke(40, 220, 170, 8 + centerPull * 14);
    }

    beginShape();
    for (let i = 0; i < 6; i++) {
      let px = v.x + i * v.len * 0.18;
      let py =
        v.y +
        sin(t * v.speed + i * 0.8 + v.seed) * v.len * 0.12 +
        map(noise(v.seed, i * 0.2, t * 0.2), 0, 1, -18, 18);
      curveVertex(px, py);
    }
    endShape();

    if (random() < 0.02 + centerPull * 0.04 + intensity * 0.03) {
      stroke(255, 255, 180, 16);
      line(v.x, v.y, v.x + random(-25, 25), v.y + random(-25, 25));
    }
  }
}

function drawState6WormField(t, intensity) {
  noFill();

  for (let w of st6Worms) {
    let cx = w.x + sin(t * w.speed + w.seed) * 30;
    let cy = w.y + cos(t * w.speed * 0.8 + w.seed) * 16;

    strokeWeight(1.2 + intensity * 0.7);
    stroke(180, 255, 80, 10 + intensity * 10);

    beginShape();
    for (let i = 0; i < 8; i++) {
      let px = cx + map(i, 0, 7, -w.len * 0.5, w.len * 0.5);
      let py = cy + sin(i * 0.9 + t * 2.2 + w.seed) * w.amp;
      curveVertex(px, py);
    }
    endShape();

    if (random() < 0.03 + intensity * 0.04) {
      stroke(40, 220, 170, 12);
      line(cx - w.len * 0.2, cy, cx + w.len * 0.2, cy + random(-12, 12));
    }
  }
}

function drawState6ScanSlices(t, intensity) {
  noStroke();

  for (let s of st6Slices) {
    let xx =
      ((s.x + sin(t * s.speed + s.seed) * width * 0.32 + width) %
        (width + s.w)) -
      s.w;
    let ww = s.w * (0.8 + noise(s.seed, t * 0.32) * 0.7);

    fill(120, 255, 110, 8 + intensity * 7);
    rect(xx, 0, ww, height);

    fill(240, 255, 180, 4 + intensity * 5);
    rect(xx + ww * 0.4, 0, ww * 0.08, height);
  }
}

function drawState6Ruptures(t, intensity) {
  noStroke();

  for (let r of st6Ruptures) {
    let shift = sin(t * r.speed + r.seed) * 36 * intensity;
    let wobble = noise(r.seed, t * 0.7) * 40;

    if (random() < 0.18 + intensity * 0.2) {
      fill(230, 255, 170, 7 + intensity * 7);
      rect(shift - 25, r.y, width + wobble, r.h);
    }

    if (random() < 0.14 + intensity * 0.16) {
      fill(170, 255, 70, 10 + intensity * 10);
      rect(
        shift + random(-18, 18),
        r.y + random(-2, 2),
        width + random(-50, 50),
        r.h * random(0.6, 1.3)
      );
    }

    if (random() < 0.12 + intensity * 0.14) {
      fill(40, 220, 170, 8 + intensity * 8);
      rect(
        shift + random(-20, 20),
        r.y + random(-1, 1),
        width,
        r.h * random(0.35, 0.9)
      );
    }
  }
}

function drawState6Motes(t, intensity) {
  noStroke();

  for (let m of st6Motes) {
    m.x += m.dx + sin(t * 0.9 + m.seed) * 0.18;
    m.y += m.dy + cos(t * 0.7 + m.seed) * 0.18;

    if (m.x < -10) m.x = width + 10;
    if (m.x > width + 10) m.x = -10;
    if (m.y < -10) m.y = height + 10;
    if (m.y > height + 10) m.y = -10;

    let d = dist(m.x, m.y, width / 2, height / 2);
    let centerGlow = constrain(1.0 - d / (min(width, height) * 0.58), 0, 1);

    fill(240, 255, 170, 8 + centerGlow * 12);
    ellipse(m.x, m.y, m.r);

    if (random() < 0.016 + centerGlow * 0.035) {
      fill(170, 255, 70, 18);
      ellipse(m.x, m.y, m.r + 2);
    }
  }
}

function drawState6AggressiveWhispers(t, intensity) {
  if (frameCount % 26 < 13) {
    textAlign(CENTER, CENTER);
    textSize(20);
    noStroke();
  }
}

function drawState6CrushFrame(intensity) {
  noFill();

  for (let i = 0; i < 18; i++) {
    stroke(0, 0, 0, 8 + i * 2 + intensity * 6);
    rect(i * 6, i * 6, width - i * 12, height - i * 12);
  }
}

//---------------------------------------------------------------------------------------------ESCALATION---------------------

function drawState7() {
  // webcam fades even more than state 6
  noStroke();
  fill(0, 0, 0, 175 + sin(frameCount * 0.05) * 60);
  rect(0, 0, width, height);

  push();
  colorMode(RGB, 255, 255, 255, 255);

  let t = (millis() - st7T0) / 1000;

  // escalation curve
  let ramp = 1.0 - exp(-t * 0.22);
  let spike = pow(constrain((t - 6.0) / 10.0, 0, 1), 1.75);
  st7Intensity = constrain(
    0.12 + 0.62 * ramp + 0.3 * spike + 0.04 * sin(t * 2.6),
    0,
    1
  );

  // flashes
  if (random() < 0.01 + 0.08 * pow(st7Intensity, 2.1)) st7WhiteFlash = 255;
  if (st7WhiteFlash > 0) st7WhiteFlash -= 42 + 26 * st7Intensity;

  // shake
  let shake = pow(st7Intensity, 1.35) * 22;
  let sx = random(-shake, shake);
  let sy = random(-shake, shake);

  // throttle render
  st7RenderToggle = !st7RenderToggle;
  let shouldRender = st7Intensity > 0.35 || st7RenderToggle;

  if (shouldRender) {
    renderState7VirusFieldFast(st7Buf, t, st7Intensity, st7WhiteFlash);
  }

  push();
  translate(sx, sy);

  let driftX = sin(t * 0.9) * 5 * st7Intensity;
  let driftY = cos(t * 0.8) * 4 * st7Intensity;

  image(st7Buf, -driftX, -driftY, width + driftX * 2, height + driftY * 2);
  pop();

  // occasional stutter
  if (random() < 0.002 * st7Intensity) st7T0 += random(-120, 120);

  pop();

  drawBox(color(255, 92, 0));
}

function makeState7Buffer() {
  st7Buf = createGraphics(st7BUF_W, st7BUF_H);
  st7Buf.pixelDensity(1);
  const ctx = st7Buf.canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
}

// function restartState7() {
//   st7T0 = millis();
//   st7Intensity = 0;
//   st7WhiteFlash = 0;
// }

function renderState7VirusFieldFast(g, t, k, flash) {
  g.loadPixels();

  let tearStrength = 1.0 + 9.5 * pow(k, 1.6);
  let shutterY = ((t * (36 + 110 * k)) % (g.height + 50)) - 25;

  let ch = 1.0 + 6.0 * pow(k, 1.6);
  let chxR = sin(t * 2.6) * ch,
    chyR = cos(t * 3.0) * ch;
  let chxG = cos(t * 2.9) * (ch * 0.55),
    chyG = sin(t * 3.2) * (ch * 0.55);
  let chxB = -sin(t * 2.4) * (ch * 0.8),
    chyB = -cos(t * 2.8) * (ch * 0.8);

  let gridFreq = 0.05 + 0.07 * k;
  let step = max(2, floor(7 - 3 * k));

  for (let y = 0; y < g.height; y++) {
    let rip = random() < 0.009 * k ? random(-1, 1) * 70 * k : 0;

    let wave = sin(y * 0.06 + t * (1.5 + 4.7 * k)) * (5 + 45 * pow(k, 1.5));
    let tear = (wave + rip) * tearStrength;

    let scan = 0.84 + 0.16 * sin(y * (0.25 + 0.2 * k) + t * (5.2 + 10.0 * k));

    let dy = abs(y - shutterY);
    let shutter = 1.0 - smoothstep(0, 38 + 70 * k, dy) * (0.35 + 0.32 * k);

    let invPulse = k > 0.4 && dy < 9 + 18 * k && random() < 0.2 * k ? 1 : 0;

    let stripe = y % step === 0 ? 1.0 : 0.0;
    let stripeSoft =
      0.35 + 0.65 * (0.5 + 0.5 * sin(t * (2.0 + 3.5 * k) + y * 0.18));
    let redLineBoost = stripe * stripeSoft * (14 + 42 * k);

    let doGlitchLine = random() < 0.012 + 0.028 * k;
    let gx0 = 0,
      gW = 0,
      gShift = 0;
    if (doGlitchLine) {
      gW = floor(random(g.width * 0.12, g.width * (0.35 + 0.1 * k)));
      gx0 = floor(random(0, max(1, g.width - gW)));
      gShift = floor(random(-10, 10) * (0.6 + 2.2 * k));
    }

    for (let x = 0; x < g.width; x++) {
      let wx = x + tear;

      let gx = sin(wx * gridFreq);
      let gy = cos(y * gridFreq * 1.02);
      let gridMask = 0.93 + 0.07 * gx * gy;

      let nx = wx * ST7_BASE_SCALE;
      let ny = y * ST7_BASE_SCALE;

      let n1 = noise(nx + t * 0.25, ny);
      let n2 = noise(nx * 2.0 - t * 0.33, ny * 2.0 + 9.0);

      let fil = 0.5 + 0.5 * sin(wx * 0.035 + y * 0.022 + t * (1.9 + 5.5 * k));

      let density = 0.68 * n1 + 0.32 * n2;
      density = pow(density, 1.18);
      density *= 0.78 + 0.52 * fil * k;

      let hot = noise(nx * 0.9 + 100.0, ny * 0.9 + t * 0.18);
      hot = smoothstep(0.64 - 0.1 * k, 0.92, hot);
      density = clamp01(density + hot * (0.2 + 0.45 * k));

      let rD = sampleState7FieldLite(nx, ny, t, k, chxR, chyR);
      let gD = sampleState7FieldLite(nx, ny, t, k, chxG, chyG);
      let bD = sampleState7FieldLite(nx, ny, t, k, chxB, chyB);

      let base = density * 0.72 + 0.28 * rD;
      let red = 16 + 225 * pow(base, 1.14);
      let green =
        2 + 32 * pow(gD, 1.35) * (0.12 + 0.88 * k) * (0.1 + 0.9 * hot);
      let blue = 1 + 16 * pow(bD, 1.55) * (0.07 + 0.55 * k);

      red *= scan * shutter * gridMask;
      green *= scan * shutter * gridMask;
      blue *= scan * shutter * gridMask;

      red = clamp255(red + redLineBoost);

      if (doGlitchLine && x >= gx0 && x < gx0 + gW) {
        let j = sin(t * 18.0 + y * 0.6) * 0.5 + 0.5;
        red = clamp255(red + (28 + 65 * k) * j);
        green = clamp255(green + (6 + 18 * k) * (1.0 - j));
        blue = clamp255(blue + (3 + 10 * k) * (1.0 - j));

        if ((x + gShift) % 7 === 0) {
          red = clamp255(red + 22 * k);
          green *= 0.92;
          blue *= 0.92;
        }
      }

      if (invPulse === 1) {
        red = 255 - red;
        green = min(255, green + 55 * k);
        blue = min(255, blue + 28 * k);
      }

      if (flash > 0) {
        let f = flash / 255;
        red = red * (1 - 0.85 * f) + 255 * (0.85 * f);
        green = green * (1 - 0.85 * f) + 255 * (0.85 * f);
        blue = blue * (1 - 0.85 * f) + 255 * (0.85 * f);
      }

      let idx = 4 * (x + y * g.width);
      g.pixels[idx + 0] = clamp255(red);
      g.pixels[idx + 1] = clamp255(green);
      g.pixels[idx + 2] = clamp255(blue);
      g.pixels[idx + 3] = 255;
    }
  }

  smearState7PixelsLite(g, t, k);
  g.updatePixels();
}

function sampleState7FieldLite(nx, ny, t, k, ox, oy) {
  let dx = ox * 0.004 * (0.35 + 1.4 * k);
  let dy = oy * 0.004 * (0.35 + 1.4 * k);
  let v = noise(nx + dx + t * 0.2, ny + dy);
  return pow(v, 1.1);
}

function smearState7PixelsLite(g, t, k) {
  if (k < 0.22) return;

  let W = g.width,
    H = g.height;
  let smears = floor(2 + 14 * pow(k, 1.5));

  for (let s = 0; s < smears; s++) {
    let y = floor(random(H));
    let shift = floor(
      random(-1, 1) * (6 + 85 * pow(k, 1.7)) * (0.7 + 0.3 * sin(t * 2.7))
    );
    let segW = floor(random(W * 0.1, W * (0.32 + 0.25 * k)));
    let x0 = floor(random(0, max(1, W - segW)));

    for (let x = 0; x < segW; x++) {
      let sx = clampInt(x0 + x + shift, 0, W - 1);
      let dx = x0 + x;

      let src = 4 * (sx + y * W);
      let dst = 4 * (dx + y * W);

      g.pixels[dst + 0] = clamp255(g.pixels[src + 0] + 28 * k);
      g.pixels[dst + 1] = clamp255(g.pixels[src + 1] + 8 * k);
      g.pixels[dst + 2] = clamp255(g.pixels[src + 2] + 5 * k);
    }
  }
}

function smoothstep(a, b, x) {
  let t = constrain((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function clamp01(v) {
  return constrain(v, 0, 1);
}

function clamp255(v) {
  return constrain(v, 0, 255);
}

function clampInt(v, a, b) {
  return v < a ? a : v > b ? b : v;
}

//-----------------------------------------------------------------------------------------BREAKDOWN--------------------------

function drawState8() {
  // webcam almost completely suppressed now
  noStroke();
  fill(0, 0, 0, 185 + sin(frameCount * 0.07) * 60);
  rect(0, 0, width, height);

  push();
  colorMode(RGB, 255, 255, 255, 255);

  let t = millis() * 0.001;
  let intensity = 1.0;

  push();
  translate(random(-10, 10), random(-10, 10));

  background(5, 0, 8, 85);

  drawState8WarpField(t, intensity);
  drawState8NoiseWaves(t, intensity);
  drawState8HallucinationRings(t, intensity);
  drawState8GlitchBars(intensity);

  spawnState8BreakWords(intensity);
  updateState8BreakWords(intensity);
  drawState8BreakWords(intensity);

  pop();

  drawState8FinalFlicker(intensity);

  pop();

  drawBox(color(255, 0, 0));
}

function drawState8WarpField(t, intensity) {
  noStroke();
  let step = 28;

  for (let y = 0; y < height + step; y += step) {
    for (let x = 0; x < width + step; x += step) {
      let nx = x * 0.004;
      let ny = y * 0.004;

      let n = noise(nx + t * 0.35, ny + t * 0.22);
      let n2 = noise(nx + 40 - t * 0.3, ny + 80 + t * 0.18);

      let px = x + map(n, 0, 1, -30, 30) * intensity;
      let py = y + map(n2, 0, 1, -30, 30) * intensity;

      let r = 120 + sin(t * 4 + x * 0.01) * 80 + intensity * 60;
      let g = 40 + n * 180;
      let b = 120 + cos(t * 3 + y * 0.012) * 100;

      fill(r, g, b, 24);
      rect(px, py, step + 4, step + 4);
    }
  }
}

function drawState8NoiseWaves(t, intensity) {
  noFill();
  strokeWeight(2);

  for (let i = 0; i < 22; i++) {
    let baseY = map(i, 0, 21, 0, height);

    stroke(255, 40, 140, 26);
    beginShape();
    for (let x = 0; x <= width; x += 14) {
      let y =
        baseY +
        sin(x * 0.02 + t * 4 + i) * 20 +
        map(noise(x * 0.01, i * 0.2, t * 0.5), 0, 1, -50, 50);
      vertex(x, y);
    }
    endShape();

    stroke(40, 255, 140, 20);
    beginShape();
    for (let x = 0; x <= width; x += 14) {
      let y =
        baseY +
        cos(x * 0.018 - t * 3 + i) * 18 +
        map(noise(x * 0.009 + 100, i * 0.2, t * 0.5), 0, 1, -45, 45);
      vertex(x, y);
    }
    endShape();
  }
}

function drawState8HallucinationRings(t, intensity) {
  noFill();

  for (let r of st8Rings) {
    let rr = r.r + sin(t * r.speed + r.seed) * 30 + 140;
    let rx = r.x + sin(t * 1.4 + r.seed) * 60;
    let ry = r.y + cos(t * 1.2 + r.seed) * 60;

    stroke(255, 0, 100, 34);
    ellipse(rx - 8, ry, rr);

    stroke(0, 255, 180, 28);
    ellipse(rx + 8, ry, rr * 0.9);

    stroke(255, 255, 255, 14);
    ellipse(rx, ry, rr * 0.7);
  }
}

function drawState8GlitchBars(intensity) {
  if (random() < 0.75) {
    st8Flashes.push({
      x: width / 2 + random(-120, 120),
      y: random(height),
      w: random(width * 0.35, width * 1.05),
      h: random(3, 16),
      life: random(120, 255),
      drift: random(-30, 30),
    });
  }

  for (let i = st8Flashes.length - 1; i >= 0; i--) {
    let f = st8Flashes[i];

    push();
    translate(f.x + random(-35, 35), f.y);

    noStroke();

    fill(255, f.life * 0.22);
    rect(0, 0, f.w, f.h);

    fill(255, f.life * 0.12);
    rect(
      random(-22, 22),
      random(-2, 2),
      f.w * random(0.85, 1.08),
      f.h * random(0.7, 1.2)
    );

    fill(255, f.life * 0.08);
    rect(
      random(-40, 40),
      random(-3, 3),
      f.w * random(0.7, 1.15),
      f.h * random(0.6, 1.3)
    );

    pop();

    if (random() < 0.08) {
      noStroke();
      fill(255, random(18, 40));
      rect(
        width / 2 + random(-30, 30),
        f.y + random(-2, 2),
        width * random(0.85, 1.2),
        random(2, 8)
      );
    }

    f.x += f.drift * 0.08;
    f.life -= random(18, 34);

    if (f.life <= 0) {
      st8Flashes.splice(i, 1);
    }
  }
}

function spawnState8BreakWords(intensity) {
  if (random() < 0.09) {
    st8DistortWords.push({
      txt: random(ST8_BREAK_WORDS),
      x: random(80, width - 80),
      y: random(80, height - 80),
      size: random(22, 54),
      life: 255,
      ang: random(-0.35, 0.35),
      stretch: random(0.85, 1.5),
    });
  }
}

function updateState8BreakWords(intensity) {
  for (let i = st8DistortWords.length - 1; i >= 0; i--) {
    let w = st8DistortWords[i];
    w.life -= 8;
    w.x += random(-4, 4);
    w.y += random(-2, 2);
    w.ang += random(-0.05, 0.05);

    if (w.life <= 0) {
      st8DistortWords.splice(i, 1);
    }
  }
}

function drawState8BreakWords(intensity) {
  textAlign(CENTER, CENTER);

  for (let w of st8DistortWords) {
    push();
    translate(w.x, w.y);
    rotate(w.ang);
    scale(w.stretch, 1);

    textSize(w.size);

    fill(255, 0, 120, w.life * 0.45);
    text(w.txt, -10, 0);

    fill(0, 255, 180, w.life * 0.35);
    text(w.txt, 10, 0);

    fill(255, w.life);
    text(w.txt, 0, random(-4, 4));

    if (random() < 0.18) {
      fill(255, 255, 255, w.life * 0.22);
      text(w.txt, random(-25, 25), random(-10, 10));
    }

    pop();
  }
}

function drawState8FinalFlicker(intensity) {
  if (random() < 0.14) {
    noStroke();
    fill(255, random(8, 28));
    rect(width / 2, height / 2, width, height);
  }

  if (random() < 0.16) {
    noStroke();
    fill(255, random(18, 45));
    rect(width / 2, random(0, 60), width, random(4, 18));
  }

  if (random() < 0.16) {
    noStroke();
    fill(255, random(18, 45));
    rect(width / 2, height - random(0, 60), width, random(4, 18));
  }

  if (random() < 0.05) {
    filter(INVERT);
  }
}

//------------------------------------------------------------------------------------------------END-------------------------

function drawState9() {
  // final state: webcam is essentially fully buried
  noStroke();
  fill(0, 0, 0, 252);
  rect(0, 0, width, height);

  push();
  colorMode(RGB, 255, 255, 255, 255);

  let age = (millis() - st9BootTime) * 0.001;

  drawState9CrashBackground(age);
  drawState9DigitalSmear(age);
  drawState9GlitchBands(age);
  drawState9SignalTears(age);
  drawState9StaticNoise(age);
  drawState9TextBlocks(age);
  drawState9FrameArtifacts(age);
  drawState9FinalFlash(age);

  pop();

  drawBox(color(255, 255, 255));
}

function initState9EndScene() {
  st9BootTime = millis();
  st9Verdict = random(st9VerdictOptions);

  st9StaticPixels = [];
  st9GlitchBands = [];
  st9TearLines = [];

  for (let i = 0; i < 110; i++) {
    st9StaticPixels.push(new State9StaticPixel());
  }

  for (let i = 0; i < 10; i++) {
    st9GlitchBands.push(new State9GlitchBand());
  }

  for (let i = 0; i < 7; i++) {
    st9TearLines.push(new State9TearLine());
  }
}

function drawState9CrashBackground(age) {
  noStroke();

  for (let y = 0; y < height; y += 10) {
    let t = y / height;
    let r = lerp(5, 22, t);
    let g = lerp(4, 8, t);
    let b = lerp(10, 36, t);
    fill(r, g, b);
    rect(0, y, width, 10);
  }

  for (let y = 0; y < height; y += 24) {
    let shift =
      sin(frameCount * 0.05 + y * 0.03) * 12 +
      (noise(y * 0.02, frameCount * 0.015) - 0.5) * 24;

    fill(255, 0, 90, 10);
    rect(shift, y, width, 12);

    fill(0, 180, 255, 10);
    rect(-shift * 0.7, y + 8, width, 10);
  }

  fill(0, 110);
  rect(0, 0, width, height);
}

function drawState9DigitalSmear(age) {
  noStroke();

  for (let i = 0; i < 10; i++) {
    let y = noise(i * 20, frameCount * 0.02) * height;
    let h = random(8, 28);
    let w = width * random(0.35, 1.0);
    let xShift = sin(frameCount * 0.08 + i * 1.7) * 25;

    fill(255, 0, 80, random(10, 28));
    rect(xShift - 10, y, w, h);

    fill(0, 180, 255, random(8, 24));
    rect(-xShift + 10, y + 2, w, h * 0.65);
  }

  for (let i = 0; i < 5; i++) {
    let y = random(height);
    let h = random(1, 3);
    fill(255, random(10, 28));
    rect(0, y, width, h);
  }
}

function drawState9GlitchBands(age) {
  for (let g of st9GlitchBands) {
    g.update(age);
    g.display();
  }
}

function drawState9SignalTears(age) {
  for (let t of st9TearLines) {
    t.update(age);
    t.display();
  }
}

function drawState9StaticNoise(age) {
  noStroke();

  for (let p of st9StaticPixels) {
    p.update(age);
    p.display();
  }

  for (let i = 0; i < 45; i++) {
    fill(255, random(15, 90));
    rect(random(width), random(height), random(1, 2), random(1, 2));
  }
}

function drawState9TextBlocks(age) {
  let cx = width * 0.08;
  let baseY = height * 0.1;

  let shakeX = random(-2, 2) * min(age * 0.18, 1.8);
  let shakeY = random(-1.5, 1.5) * min(age * 0.14, 1.5);

  push();
  translate(shakeX, shakeY);

  textAlign(LEFT, TOP);

  textSize(min(width, height) * 0.022);
  state9GlitchText("FINAL PROCESSING REPORT", cx, baseY, 1.8);

  let bodyY = baseY + 70;
  textSize(min(width, height) * 0.038);

  state9GlitchText("YOU HAVE BEEN PROCESSED", cx, bodyY, 3);
  state9GlitchText("THE SYSTEM HAS REACHED A CONCLUSION", cx, bodyY + 70, 2.0);

  let verdictY = bodyY + 180;
  textSize(min(width, height) * 0.07);
  state9GlitchText("VERDICT:", cx, verdictY, 3.0);

  let reveal = floor(
    map(constrain(age, 0, 5.5), 0, 5.5, 0, st9Verdict.length + 1)
  );
  let shownVerdict = st9Verdict.substring(0, reveal);

  textSize(min(width, height) * 0.09);

  let vx = cx + random(-2, 2);
  let vy = verdictY + 92 + random(-2, 2);

  fill(255, 40, 100, 90);
  text(shownVerdict, vx + 4, vy);

  fill(80, 220, 255, 90);
  text(shownVerdict, vx - 4, vy);

  fill(255);
  text(shownVerdict, vx, vy);

  if (frameCount % 20 < 10 && reveal < st9Verdict.length + 1) {
    noStroke();
    fill(255);
    rect(vx + textWidth(shownVerdict) + 12, vy + 10, 16, 5);
  }

  textSize(min(width, height) * 0.014);
  fill(255, 180);
  text("STATUS: SUBJECT REDUCED TO OUTPUT", cx, height * 0.83);
  text("TRACE: FAILED RESOLUTION", cx, height * 0.87);

  pop();
}

function state9GlitchText(txt, x, y, intensity) {
  let ox1 = random(-intensity, intensity);
  let ox2 = random(-intensity, intensity);
  let oy1 = random(-intensity * 0.5, intensity * 0.5);
  let oy2 = random(-intensity * 0.5, intensity * 0.5);

  fill(255, 40, 120, 90);
  text(txt, x + ox1 + 3, y + oy1);

  fill(80, 220, 255, 90);
  text(txt, x + ox2 - 3, y + oy2);

  fill(255, 245, 245);
  text(txt, x, y);

  if (random() < 0.07) {
    noStroke();
    fill(255, random(15, 45));
    rect(x - 8, y + random(0, 18), textWidth(txt) + 18, random(2, 5));
  }
}

function drawState9FrameArtifacts(age) {
  noFill();

  strokeWeight(2);
  stroke(255, 255, 255, 32);
  rect(20, 20, width - 40, height - 40);

  for (let i = 0; i < 8; i++) {
    let x = random() < 0.5 ? 20 : width - 20;
    let y = random(height);
    stroke(random() < 0.5 ? color(255, 50, 120, 70) : color(80, 220, 255, 70));
    line(x, y, x + random(-30, 30), y + random(-16, 16));
  }

  strokeWeight(1);
  for (let y = 0; y < height; y += 4) {
    stroke(255, 10);
    line(0, y, width, y);
  }

  for (let i = 0; i < 4; i++) {
    let x = noise(frameCount * 0.02 + i * 50) * width;
    stroke(255, random(8, 24));
    line(x, 0, x, height);
  }
}

function drawState9FinalFlash(age) {
  let pulse = 0;

  if (age > 4.5) {
    pulse = map(sin(frameCount * 0.24), -1, 1, 0, 40);
  }

  if (random() < 0.008) {
    pulse += random(25, 75);
  }

  noStroke();
  fill(255, 220, 240, pulse + st9FinalFlash);
  rect(0, 0, width, height);

  st9FinalFlash *= 0.86;
}

class State9StaticPixel {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(height);
    this.s = random(1, 3);
    this.a = random(15, 110);
    this.vx = random(-0.45, 0.45);
    this.vy = random(-0.25, 0.25);
    this.rgbSplit = random() < 0.16;
  }

  update(age) {
    this.x += this.vx * (1 + age * 0.02);
    this.y += this.vy * (1 + age * 0.02);

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    if (random() < 0.02) {
      this.a = random(15, 110);
      this.s = random(1, 3);
      this.rgbSplit = random() < 0.16;
    }
  }

  display() {
    fill(255, this.a);
    rect(this.x, this.y, this.s, this.s);

    if (this.rgbSplit) {
      fill(255, 50, 120, this.a * 0.45);
      rect(this.x + 2, this.y, this.s, this.s);

      fill(80, 220, 255, this.a * 0.45);
      rect(this.x - 2, this.y, this.s, this.s);
    }
  }
}

class State9GlitchBand {
  constructor() {
    this.reset();
  }

  reset() {
    this.y = random(height);
    this.h = random(10, 45);
    this.speed = random(0.7, 2.7);
    this.alpha = random(16, 52);
    this.offset = random(-80, 80);
    this.colMode = random() < 0.5 ? 0 : 1;
  }

  update(age) {
    this.y += this.speed * (1 + age * 0.015);

    if (this.y > height + this.h) {
      this.y = -this.h;
      this.h = random(10, 45);
      this.speed = random(0.7, 2.7);
      this.alpha = random(16, 52);
      this.offset = random(-80, 80);
      this.colMode = random() < 0.5 ? 0 : 1;
    }
  }

  display() {
    noStroke();

    if (this.colMode === 0) {
      fill(255, 40, 120, this.alpha);
      rect(this.offset, this.y, width * 0.88, this.h);

      fill(80, 220, 255, this.alpha * 0.65);
      rect(this.offset - 10, this.y + 2, width * 0.88, this.h * 0.6);
    } else {
      fill(255, this.alpha * 0.55);
      rect(this.offset * 0.2, this.y, width, this.h * 0.28);

      fill(120, 0, 255, this.alpha * 0.35);
      rect(
        -this.offset * 0.25,
        this.y + this.h * 0.35,
        width * 0.78,
        this.h * 0.5
      );
    }
  }
}

class State9TearLine {
  constructor() {
    this.reset();
  }

  reset() {
    this.y = random(height);
    this.speed = random(0.4, 1.6);
    this.segs = floor(random(4, 10));
  }

  update(age) {
    this.y += this.speed * (1 + age * 0.02);

    if (this.y > height + 10) {
      this.y = -10;
      this.segs = floor(random(4, 10));
      this.speed = random(0.4, 1.6);
    }
  }

  display() {
    noStroke();

    for (let j = 0; j < this.segs; j++) {
      let x = random(width);
      let w = random(25, 120);
      let off = random(-14, 14);

      fill(255, 50, 120, random(14, 35));
      rect(x + off, this.y, w, random(1, 4));

      fill(100, 220, 255, random(14, 35));
      rect(x - off, this.y + 2, w, random(1, 3));
    }
  }
}

//---------------------------------------------------------------------------------------------------------------------------------

//resets the timers each detection
function resetTimers() {
  happyStart = null;
  angryStart = null;
  surprisedStart = null;
  neutralStart = null;
  fearfulStart = null;
  sadStart = null;
  disgustedStart = null;
}

//distorts the values
function distortValue(emotion, v, amount) {
  //to change accuracy
  let corruption;

  //early states are slightly wrong, middle states are 50/50, last states are mostly wrong
  let corruptionByState = {
    1: 0,
    2: 0.05,
    3: 0.15,
    4: 0.4,
    5: 0.5,
    6: 0.65,
    7: 0.8,
    8: 0.9,
    9: 1.0,
  };

  //defaults to 0.5 if theres a logic error
  corruption = corruptionByState[state] ?? 0.5;

  //creates random value
  let randomValue = random();

  // blends real value with random value
  let distorted = lerp(v, randomValue, corruption);

  return constrain(distorted, 0, 1);
}

//plays audio each state plus a random delay
function playAudio() {
  console.log("playAudio called, state:", state);
  let audio = new Audio("data/audio_" + state + ".mp3");
  audioStartTime = millis();

  audio.addEventListener("loadedmetadata", function () {
    let audioDuration = audio.duration * 1000;
    let extraDelay = random(3000, 10000);
    let totalDuration = audioDuration + extraDelay;

    audio.play();
    audioTotalDuration = totalDuration;

    setTimeout(function () {
      audioPlaying = false;
      determineTransition();
    }, totalDuration);
  });
}

function determineTransition() {
  //for last state / end of program
  if (state === 9) return;

  let emotionDetected = Object.keys(emotionPoints).reduce((a, b) =>
    emotionPoints[a] > emotionPoints[b] ? a : b
  );
  //logs the point logic
  console.log("Points:", emotionPoints);
  console.log("Emotion Detected:", emotionDetected);

  // Determine tier based on state
  let tier = state <= 3 ? 1 : state <= 5 ? 2 : 3;

  // jump amounts per tier
  //some have a 50/50 chance between two jumps
  let jumps = {
    1: {
      happy: 1,
      neutral: 0,
      angry: 2,
      surprised: 1,
      fearful: 2,
      sad: 2,
      disgusted: 2,
    },
    2: {
      happy: random() < 0.5 ? 1 : 0,
      neutral: 0,
      angry: random() < 0.5 ? 2 : 1,
      surprised: random() < 0.5 ? 1 : 0,
      fearful: random() < 0.5 ? 2 : 1,
      sad: random() < 0.5 ? 2 : 1,
      disgusted: random() < 0.5 ? 2 : 1,
    },
    3: {
      happy: random() < 0.5 ? 1 : 0,
      neutral: 0,
      angry: random() < 0.5 ? 2 : 1,
      surprised: random() < 0.5 ? 1 : 0,
      fearful: random() < 0.5 ? 2 : 1,
      sad: random() < 0.5 ? 2 : 1,
      disgusted: random() < 0.5 ? 2 : 1,
    },
  };
  //set display to correct emotion
  lastDetectedEmotion = emotionDetected;

  let jump = jumps[tier][emotionDetected];
  let newState = constrain(state + jump, 1, 9);

  if (newState === state) {
    // if the same state no audio and extra 10 - 20 secs
    let retryDelay = random(10000, 20000);
    audioTotalDuration = retryDelay;
    audioStartTime = millis();
    audioPlaying = true;
    setTimeout(function () {
      audioPlaying = false;
      determineTransition();
    }, retryDelay);
    console.log("Same state, retrying in", retryDelay / 1000 + "s");
  } else {
    state = newState;
    console.log("Transitioned to State:", state);
    if (state === 9) {
      audioPlaying = false;
      audio9 = new Audio("data/audio_9.mp3");
      audio9.play().catch((e) => console.log("Playback error:", e));
      audio9.onended = function () {
        background(0);
        noLoop();
      };
      return;
    }
  }

  //resets points
  emotionPoints = {
    happy: 0,
    angry: 0,
    surprised: 0,
    neutral: 0,
    fearful: 0,
    sad: 0,
    disgusted: 0,
  };
  resetTimers();
}

//draws detection box with specific color
function drawBox(color) {
  if (detections) {
    let box = detections.detection.box;
    let scaleX = width / 640;
    let scaleY = height / 480;
    noFill();
    stroke(color);
    strokeWeight(3.5);
    rect(
      box.x * scaleX,
      box.y * scaleY,
      box.width * scaleX,
      box.height * scaleY
    );
  }
}
