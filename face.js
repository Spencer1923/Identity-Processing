//global vars
let video;
let detections = null;
let state = 1;

//for neutral detection stall
let neutralStall = false;

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

//for pulsing detection box
let boxPulseAlpha = 255;

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
const neutralThreshold = 0.8;
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

let st5CurrentEmotion = "neutral";
let st5TargetEmotion = "neutral";

let st5EmotionLerp = 0.08;
let st5MotionMultiplier = 1.0;
let st5TargetMotionMultiplier = 1.0;

let st5LeftColorTop, st5LeftColorBottom, st5RightColorTop, st5RightColorBottom;
let st5TargetLeftTop,
  st5TargetLeftBottom,
  st5TargetRightTop,
  st5TargetRightBottom;

let st5DoubtLevel = 0.22;
let st5TargetDoubtLevel = 0.22;

let st5GlitchAmount = 0.2;
let st5TargetGlitchAmount = 0.2;

let st5GlitchFreq = 0.12;
let st5TargetGlitchFreq = 0.12;

const st5EmotionStyles = {
  happy: {
    motion: 0.95,
    doubt: 0.16,
    glitchAmount: 0.1,
    glitchFreq: 0.06,
    leftTop: [52, 28, 78],
    leftBottom: [185, 225, 70],
    rightTop: [255, 228, 80],
    rightBottom: [120, 240, 235],
  },
  angry: {
    motion: 1.28,
    doubt: 0.28,
    glitchAmount: 0.32,
    glitchFreq: 0.22,
    leftTop: [70, 16, 24],
    leftBottom: [210, 60, 50],
    rightTop: [255, 155, 45],
    rightBottom: [170, 60, 70],
  },
  surprised: {
    motion: 1.2,
    doubt: 0.24,
    glitchAmount: 0.24,
    glitchFreq: 0.18,
    leftTop: [40, 30, 90],
    leftBottom: [170, 255, 120],
    rightTop: [255, 245, 120],
    rightBottom: [130, 235, 255],
  },
  neutral: {
    motion: 0.88,
    doubt: 0.2,
    glitchAmount: 0.08,
    glitchFreq: 0.05,
    leftTop: [32, 18, 58],
    leftBottom: [145, 195, 40],
    rightTop: [255, 210, 40],
    rightBottom: [60, 210, 230],
  },
  fearful: {
    motion: 1.12,
    doubt: 0.27,
    glitchAmount: 0.26,
    glitchFreq: 0.2,
    leftTop: [18, 42, 62],
    leftBottom: [120, 235, 180],
    rightTop: [170, 220, 255],
    rightBottom: [70, 130, 220],
  },
  sad: {
    motion: 0.72,
    doubt: 0.24,
    glitchAmount: 0.12,
    glitchFreq: 0.08,
    leftTop: [25, 24, 60],
    leftBottom: [90, 140, 110],
    rightTop: [130, 170, 230],
    rightBottom: [70, 120, 170],
  },
  disgusted: {
    motion: 1.02,
    doubt: 0.3,
    glitchAmount: 0.22,
    glitchFreq: 0.16,
    leftTop: [48, 42, 18],
    leftBottom: [155, 185, 55],
    rightTop: [170, 135, 70],
    rightBottom: [95, 165, 110],
  },
};

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

// emotion control
let st6CurrentEmotion = "neutral";

let st6MotionSpeed = 1.0;
let st6TargetMotionSpeed = 1.0;

let st6PulseStrength = 1.0;
let st6TargetPulseStrength = 1.0;

let st6ScanSpeedBoost = 1.0;
let st6TargetScanSpeedBoost = 1.0;

let st6RuptureAmount = 1.0;
let st6TargetRuptureAmount = 1.0;

let st6GlowStrength = 1.0;
let st6TargetGlowStrength = 1.0;

let st6ControlLerp = 0.06;

// palette
let st6BgColA,
  st6BgColB,
  st6SideColA,
  st6SideColB,
  st6HaloColA,
  st6HaloColB,
  st6CoreColA,
  st6CoreColB;
let st6TargetBgColA,
  st6TargetBgColB,
  st6TargetSideColA,
  st6TargetSideColB,
  st6TargetHaloColA,
  st6TargetHaloColB,
  st6TargetCoreColA,
  st6TargetCoreColB;

const st6EmotionStyles = {
  happy: {
    motionSpeed: 1.02,
    pulseStrength: 1.05,
    scanSpeedBoost: 0.95,
    ruptureAmount: 0.85,
    glowStrength: 1.18,
    bgA: [8, 16, 6],
    bgB: [30, 90, 28],
    sideA: [170, 240, 70],
    sideB: [80, 235, 170],
    haloA: [190, 255, 90],
    haloB: [80, 240, 190],
    coreA: [140, 220, 40],
    coreB: [245, 255, 190],
  },
  angry: {
    motionSpeed: 1.32,
    pulseStrength: 1.28,
    scanSpeedBoost: 1.35,
    ruptureAmount: 1.35,
    glowStrength: 1.06,
    bgA: [10, 8, 4],
    bgB: [95, 42, 12],
    sideA: [220, 90, 30],
    sideB: [180, 255, 70],
    haloA: [240, 120, 50],
    haloB: [170, 255, 80],
    coreA: [220, 130, 20],
    coreB: [255, 240, 150],
  },
  surprised: {
    motionSpeed: 1.18,
    pulseStrength: 1.15,
    scanSpeedBoost: 1.22,
    ruptureAmount: 1.08,
    glowStrength: 1.2,
    bgA: [10, 14, 8],
    bgB: [42, 110, 28],
    sideA: [210, 255, 100],
    sideB: [90, 245, 210],
    haloA: [235, 255, 130],
    haloB: [100, 250, 220],
    coreA: [170, 240, 55],
    coreB: [255, 255, 200],
  },
  neutral: {
    motionSpeed: 1.0,
    pulseStrength: 1.0,
    scanSpeedBoost: 1.0,
    ruptureAmount: 1.0,
    glowStrength: 1.0,
    bgA: [4, 6, 3],
    bgB: [22, 64, 18],
    sideA: [180, 255, 60],
    sideB: [40, 220, 170],
    haloA: [180, 255, 70],
    haloB: [40, 220, 170],
    coreA: [170, 230, 40],
    coreB: [240, 255, 180],
  },
  fearful: {
    motionSpeed: 1.12,
    pulseStrength: 1.1,
    scanSpeedBoost: 1.15,
    ruptureAmount: 1.12,
    glowStrength: 0.96,
    bgA: [4, 10, 8],
    bgB: [16, 80, 58],
    sideA: [120, 255, 150],
    sideB: [90, 220, 255],
    haloA: [150, 255, 170],
    haloB: [80, 225, 255],
    coreA: [100, 230, 170],
    coreB: [220, 255, 210],
  },
  sad: {
    motionSpeed: 0.78,
    pulseStrength: 0.86,
    scanSpeedBoost: 0.82,
    ruptureAmount: 0.88,
    glowStrength: 0.82,
    bgA: [4, 6, 6],
    bgB: [12, 42, 52],
    sideA: [90, 170, 140],
    sideB: [80, 150, 220],
    haloA: [120, 180, 150],
    haloB: [100, 170, 230],
    coreA: [90, 150, 120],
    coreB: [190, 220, 210],
  },
  disgusted: {
    motionSpeed: 1.04,
    pulseStrength: 1.12,
    scanSpeedBoost: 1.1,
    ruptureAmount: 1.18,
    glowStrength: 0.94,
    bgA: [10, 10, 4],
    bgB: [70, 82, 18],
    sideA: [165, 190, 45],
    sideB: [110, 170, 90],
    haloA: [175, 205, 60],
    haloB: [120, 180, 100],
    coreA: [145, 170, 30],
    coreB: [230, 235, 150],
  },
};

// -----------------------------
// State 7: Escalation
// -----------------------------
let st7Buf;
let st7T0 = 0;
let st7Intensity = 0;
let st7WhiteFlash = 0;
let st7RenderToggle = false;

let st7BUF_W = 140;
let st7BUF_H = 95;
const ST7_BASE_SCALE = 0.014;

let st7EmotionMode = "neutral";
let st7CurrentProfile = null;

let st7SlidePhrases = [];
const ST7_ESCALATION_PHRASES = [
  "SIGNAL RISING",
  "READING YOU",
  "PATTERN SHIFT",
  "INSTABILITY DETECTED",
  "INTENSITY INCREASING",
  "SYSTEM FOCUSING",
  "EMOTION DRIFT",
  "ESCALATION ACTIVE",
  "YOU ARE CHANGING",
  "INTERPRETATION MOVING",
  "CORRECTION STARTED",
  "BIAS INCREASING",
  "HOLD STILL",
  "SCAN DEEPER",
  "SYSTEM CLOSING IN",
  "PRESSURE BUILDING",
  "UNSTABLE SIGNAL",
  "RESPONSE DETECTED",
  "READING CONFLICT",
  "TRACKING YOU",
  "PRESSURE INCREASING",
  "ESCALATION IN PROGRESS",
  "SIGNAL AMPLIFYING",
  "INSTABILITY RISING",
  "SCANNING DEEPER",
  "FORCING CLARITY",
  "EXTRACTING SIGNAL",
  "INTENSIFYING INTERPRETATION",
  "CONTROL THRESHOLD NEAR",
  "SYSTEM STRAIN DETECTED",
  "STABILITY COMPROMISED",
  "ERROR RATE CLIMBING",
  "SUPPRESSION WEAKENING",
  "READING BECOMING UNSTABLE",
  "INTERPRETATION DRIFT DETECTED",
  "REGULATION FAILING",
  "RESISTANCE DETECTED",
  "COOPERATION FAILURE ESCALATING",
  "YOUR SIGNAL IS DETERIORATING",
  "FURTHER PRESSURE REQUIRED",
];

const st7EmotionProfiles = {
  happy: {
    name: "happy",
    speedMul: 1.1,
    shakeMul: 0.75,
    flashMul: 0.7,
    glitchMul: 0.7,
    smearMul: 0.7,
    rampMul: 1.0,
    redMul: 1.08,
    greenMul: 0.4,
    blueMul: 0.62,
    structure: 0.25,
    veinAmp: 0.35,
    ringAmp: 0.75,
    shredAmp: 0.15,
    pulseAmp: 0.9,
    droopAmp: 0.1,
    contaminationAmp: 0.05,
    flashTintR: 255,
    flashTintG: 210,
    flashTintB: 235,
  },
  angry: {
    name: "angry",
    speedMul: 1.55,
    shakeMul: 1.55,
    flashMul: 1.35,
    glitchMul: 1.45,
    smearMul: 1.2,
    rampMul: 1.28,
    redMul: 1.3,
    greenMul: 0.16,
    blueMul: 0.12,
    structure: 0.95,
    veinAmp: 1.1,
    ringAmp: 0.2,
    shredAmp: 1.2,
    pulseAmp: 0.55,
    droopAmp: 0.05,
    contaminationAmp: 0.08,
    flashTintR: 255,
    flashTintG: 120,
    flashTintB: 120,
  },
  surprised: {
    name: "surprised",
    speedMul: 1.3,
    shakeMul: 1.15,
    flashMul: 1.7,
    glitchMul: 1.05,
    smearMul: 0.85,
    rampMul: 1.15,
    redMul: 1.18,
    greenMul: 0.5,
    blueMul: 0.1,
    structure: 0.72,
    veinAmp: 0.25,
    ringAmp: 1.15,
    shredAmp: 0.45,
    pulseAmp: 1.2,
    droopAmp: 0.05,
    contaminationAmp: 0.04,
    flashTintR: 255,
    flashTintG: 225,
    flashTintB: 150,
  },
  neutral: {
    name: "neutral",
    speedMul: 1.0,
    shakeMul: 1.0,
    flashMul: 1.0,
    glitchMul: 1.0,
    smearMul: 1.0,
    rampMul: 1.0,
    redMul: 1.0,
    greenMul: 1.0,
    blueMul: 1.0,
    structure: 0.5,
    veinAmp: 0.65,
    ringAmp: 0.4,
    shredAmp: 0.6,
    pulseAmp: 0.7,
    droopAmp: 0.15,
    contaminationAmp: 0.1,
    flashTintR: 255,
    flashTintG: 255,
    flashTintB: 255,
  },
  fearful: {
    name: "fearful",
    speedMul: 1.2,
    shakeMul: 1.2,
    flashMul: 1.45,
    glitchMul: 1.15,
    smearMul: 0.85,
    rampMul: 1.08,
    redMul: 0.94,
    greenMul: 0.16,
    blueMul: 0.42,
    structure: 0.82,
    veinAmp: 0.95,
    ringAmp: 0.28,
    shredAmp: 0.35,
    pulseAmp: 0.55,
    droopAmp: 0.08,
    contaminationAmp: 0.06,
    flashTintR: 245,
    flashTintG: 225,
    flashTintB: 255,
  },
  sad: {
    name: "sad",
    speedMul: 0.72,
    shakeMul: 0.55,
    flashMul: 0.45,
    glitchMul: 0.72,
    smearMul: 1.15,
    rampMul: 0.78,
    redMul: 0.76,
    greenMul: 0.2,
    blueMul: 0.32,
    structure: 0.35,
    veinAmp: 0.22,
    ringAmp: 0.18,
    shredAmp: 0.12,
    pulseAmp: 0.2,
    droopAmp: 1.05,
    contaminationAmp: 0.12,
    flashTintR: 210,
    flashTintG: 210,
    flashTintB: 230,
  },
  disgusted: {
    name: "disgusted",
    speedMul: 1.05,
    shakeMul: 0.95,
    flashMul: 0.82,
    glitchMul: 1.48,
    smearMul: 1.5,
    rampMul: 1.02,
    redMul: 0.96,
    greenMul: 0.8,
    blueMul: 0.12,
    structure: 0.88,
    veinAmp: 0.55,
    ringAmp: 0.12,
    shredAmp: 0.78,
    pulseAmp: 0.22,
    droopAmp: 0.35,
    contaminationAmp: 1.2,
    flashTintR: 235,
    flashTintG: 255,
    flashTintB: 180,
  },
};

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

// -----------------------------
// Neutral
// -----------------------------

let dots = 0;
let lastDotChange = 0;

let glitchSlices = [];
let errorGlitchTimer = 0;
let errorGlitchActive = false;

// zap state
let zapActive = false;
let zapTimer = 0;
let zapDuration = 0;
let zapIntensity = 0;
let zapType = 1;

// prompt system
let promptMessages = [
  "READABLE EXPRESSION REQUIRED FOR CONTINUED PROCESSING",
  "FACIAL RESPONSE INSUFFICIENT FOR ANALYSIS",
  "EXPRESSION DATA UNREADABLE. RETRY REQUIRED",
  "EMOTIONAL CONFIRMATION REQUIRED BEFORE PROCEEDING",
  "CURRENT FACIAL STATE CANNOT BE PROCESSED",
  "INPUT REJECTED: INSUFFICIENT EXPRESSIVE VARIANCE",
  "COOPERATION FAILURE DETECTED IN FACIAL INPUT",
  "LACK OF EXPRESSIVE INPUT IS DISRUPTING ANALYSIS",
  "PROCESSING DELAYED BY INVALID USER RESPONSE",
  "BLANK FACIAL STATE WILL NOT BE ACCEPTED",
  "SHOW MORE EMOTION OR WE CANNOT PROCEED",
  "A VALID EXPRESSION IS REQUIRED TO CONTINUE",
  "ARE YOU EVEN TRYING TO COOPERATE",
  "NO VALID EXPRESSION HAS BEEN DETECTED",
  "YOUR LACK OF EMOTION IS DISRUPTING THE SYSTEM",
  "YOUR BLANK EXPRESSIONS WILL NOT BE PROCESSED",
  "PROVIDE A READABLE EXPRESSION TO CONTINUE",
  "EMOTIONAL RESPONSE REQUIRED FOR PROCESSING",
  "CURRENT INPUT DOES NOT MEET REQUIREMENTS",
  "YOU ARE NOT PROVIDING USABLE DATA",
  "THIS LEVEL OF RESPONSE IS NOT ACCEPTABLE",
  "CONTINUE WITH A VALID EXPRESSION",
  "YOUR RESPONSE REMAINS INSUFFICIENT",
  "YOU ARE FAILING TO PROVIDE A CLEAR SIGNAL",
  "WHY ARE YOU NOT RESPONDING PROPERLY",
];

let currentPrompt = "";
//--
function smoothstep(edge0, edge1, x) {
  if (edge0 === edge1) return 0;
  let t = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function clamp255(v) {
  return constrain(v, 0, 255);
}

function clampInt(v, minVal, maxVal) {
  return int(constrain(v, minVal, maxVal));
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

//function drawState5() {
// make webcam much less visible
function applyState5EmotionInstant(emotionName) {
  let e = st5EmotionStyles[emotionName] || st5EmotionStyles.neutral;

  st5CurrentEmotion = emotionName;
  st5TargetEmotion = emotionName;

  st5MotionMultiplier = e.motion;
  st5TargetMotionMultiplier = e.motion;

  st5DoubtLevel = e.doubt;
  st5TargetDoubtLevel = e.doubt;

  st5GlitchAmount = e.glitchAmount;
  st5TargetGlitchAmount = e.glitchAmount;

  st5GlitchFreq = e.glitchFreq;
  st5TargetGlitchFreq = e.glitchFreq;

  st5LeftColorTop = color(...e.leftTop);
  st5LeftColorBottom = color(...e.leftBottom);
  st5RightColorTop = color(...e.rightTop);
  st5RightColorBottom = color(...e.rightBottom);

  st5TargetLeftTop = color(...e.leftTop);
  st5TargetLeftBottom = color(...e.leftBottom);
  st5TargetRightTop = color(...e.rightTop);
  st5TargetRightBottom = color(...e.rightBottom);
}

function setState5Emotion(emotionName) {
  let e = st5EmotionStyles[emotionName] || st5EmotionStyles.neutral;

  st5CurrentEmotion = emotionName;
  st5TargetEmotion = emotionName;

  st5TargetMotionMultiplier = e.motion;
  st5TargetDoubtLevel = e.doubt;
  st5TargetGlitchAmount = e.glitchAmount;
  st5TargetGlitchFreq = e.glitchFreq;

  st5TargetLeftTop = color(...e.leftTop);
  st5TargetLeftBottom = color(...e.leftBottom);
  st5TargetRightTop = color(...e.rightTop);
  st5TargetRightBottom = color(...e.rightBottom);
}

function updateState5EmotionStyle() {
  st5MotionMultiplier = lerp(
    st5MotionMultiplier,
    st5TargetMotionMultiplier,
    st5EmotionLerp
  );
  st5DoubtLevel = lerp(st5DoubtLevel, st5TargetDoubtLevel, st5EmotionLerp);
  st5GlitchAmount = lerp(
    st5GlitchAmount,
    st5TargetGlitchAmount,
    st5EmotionLerp
  );
  st5GlitchFreq = lerp(st5GlitchFreq, st5TargetGlitchFreq, st5EmotionLerp);

  st5LeftColorTop = lerpColor(
    st5LeftColorTop,
    st5TargetLeftTop,
    st5EmotionLerp
  );
  st5LeftColorBottom = lerpColor(
    st5LeftColorBottom,
    st5TargetLeftBottom,
    st5EmotionLerp
  );
  st5RightColorTop = lerpColor(
    st5RightColorTop,
    st5TargetRightTop,
    st5EmotionLerp
  );
  st5RightColorBottom = lerpColor(
    st5RightColorBottom,
    st5TargetRightBottom,
    st5EmotionLerp
  );
}

function makeState5NoiseLayer() {
  st5NoiseLayer.clear();
  st5NoiseLayer.loadPixels();

  for (let y = 0; y < st5NoiseLayer.height; y++) {
    for (let x = 0; x < st5NoiseLayer.width; x++) {
      let i = 4 * (x + y * st5NoiseLayer.width);
      let v = random(6, 18);
      st5NoiseLayer.pixels[i + 0] = v;
      st5NoiseLayer.pixels[i + 1] = v;
      st5NoiseLayer.pixels[i + 2] = v;
      st5NoiseLayer.pixels[i + 3] = random(8, 24);
    }
  }

  st5NoiseLayer.updatePixels();
}

function drawState5() {
  updateState5EmotionStyle();

  noStroke();
  fill(0, 0, 0, 0 + sin(frameCount * 0.025) * 20);
  rect(0, 0, width, height);

  st5T += 0.008 * st5MotionMultiplier;

  st5SceneLayer.clear();
  drawState5SceneToLayer(st5SceneLayer);

  push();
  colorMode(RGB, 255, 255, 255, 255);
  background(8, 10, 14, 0);
  drawState5GlitchOutput(st5SceneLayer);
  image(st5NoiseLayer, 0, 0);

  if (frameCount % 140 < 2 && random() < 0.45) {
    fill(220, 255, 180, 8 + st5DoubtLevel * 8);
    noStroke();
    rect(0, 0, width, height);
  }

  pop();

  drawBox(color(255, 172, 0));
}

function drawState5SceneToLayer(pg) {
  drawState5GradientBackground(pg);
  drawState5ContradictionField(pg);
  drawState5GlassRipples(pg);
  drawState5SeamGlow(pg);
  drawState5CenterTear(pg);
  drawState5RibbonsLayer(pg);
  drawState5ParticlesLayer(pg);
  drawState5DoubtWordsLayer(pg);
}

function drawState5GradientBackground(pg) {
  pg.noStroke();

  for (let y = 0; y < height; y++) {
    let n = y / height;

    let c1 = lerpColor(st5LeftColorTop, st5LeftColorBottom, n);
    let c2 = lerpColor(st5RightColorTop, st5RightColorBottom, n);

    let splitWobble =
      width * 0.5 +
      sin(y * 0.012 + st5T * 2.0) * (55 + st5DoubtLevel * 25) +
      sin(y * 0.005 - st5T * 1.3) * 30 +
      noise(y * 0.012, st5T * 0.45) * (95 + st5DoubtLevel * 45) -
      50;

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
      width * 0.24 +
      sin(st5T * 0.9 + i * 0.5) * (175 + st5DoubtLevel * 35) +
      cos(st5T * 1.7 + i) * 34;
    let y =
      height * (i / 18) +
      sin(st5T * 1.8 + i * 1.2) * (70 + st5MotionMultiplier * 8);
    let s = 140 + sin(st5T * 2.6 + i * 0.8) * 70;

    pg.fill(
      red(st5LeftColorBottom),
      green(st5LeftColorBottom),
      blue(st5LeftColorBottom),
      14 + st5DoubtLevel * 10
    );
    pg.ellipse(x, y, s * 1.4, s * 0.9);

    pg.fill(
      red(st5RightColorTop),
      green(st5RightColorTop),
      blue(st5RightColorTop),
      8 + st5DoubtLevel * 7
    );
    pg.ellipse(x + 20, y - 10, s * 0.6, s * 0.45);
  }

  for (let i = 0; i < 18; i++) {
    let x =
      width * 0.76 +
      cos(st5T * 1.0 + i * 0.6) * (180 + st5DoubtLevel * 30) +
      sin(st5T * 1.6 + i) * 42;
    let y =
      height * (i / 18) +
      cos(st5T * 1.7 + i * 1.1) * (74 + st5MotionMultiplier * 8);
    let s = 135 + cos(st5T * 2.4 + i * 0.7) * 70;

    pg.fill(
      red(st5RightColorBottom),
      green(st5RightColorBottom),
      blue(st5RightColorBottom),
      15 + st5DoubtLevel * 10
    );
    pg.ellipse(x, y, s, s * 1.3);

    pg.fill(
      red(st5LeftColorTop),
      green(st5LeftColorTop),
      blue(st5LeftColorTop),
      8 + st5DoubtLevel * 6
    );
    pg.ellipse(x - 18, y + 8, s * 0.55, s * 0.45);
  }

  for (let i = 0; i < 10; i++) {
    let yy = map(i, 0, 9, 0, height);
    let offset =
      sin(st5T * 3.6 + i * 0.8) * 42 +
      cos(st5T * 2.0 + i * 0.4) * 18 +
      noise(i * 0.2, st5T) * 58 -
      29;
    let x = width / 2 + offset;
    let s = 82 + sin(st5T * 5 + i) * 28;

    pg.fill(245, 255, 220, 12 + st5DoubtLevel * 10);
    pg.ellipse(x, yy, s * 2.0, s * 0.55);
  }
}

function drawState5SeamGlow(pg) {
  pg.noStroke();

  for (let i = 0; i < 34; i++) {
    let alpha = map(i, 0, 33, 34 + st5DoubtLevel * 18, 0);
    let w = map(i, 0, 33, 18, 205);
    let xOffset =
      sin(st5T * 5.4 + i * 0.35) * (14 + st5DoubtLevel * 10) +
      cos(st5T * 2.2 + i * 0.2) * 8;

    pg.fill(235, 255, 210, alpha);
    pg.beginShape();
    for (let y = 0; y <= height; y += 20) {
      let nx =
        width / 2 +
        xOffset +
        sin(y * 0.024 + st5T * 2.5 + i * 0.32) * (10 + i * 0.8) +
        cos(y * 0.01 - st5T * 2.8) * 8 +
        noise(y * 0.012, st5T * 0.7 + i) * (34 + st5DoubtLevel * 20) -
        17;
      pg.vertex(nx - w * 0.14, y);
    }
    for (let y = height; y >= 0; y -= 20) {
      let nx =
        width / 2 +
        xOffset +
        sin(y * 0.024 + st5T * 2.5 + i * 0.32) * (10 + i * 0.8) +
        cos(y * 0.01 - st5T * 2.8) * 8 +
        noise(y * 0.012, st5T * 0.7 + i) * (34 + st5DoubtLevel * 20) -
        17;
      pg.vertex(nx + w * 0.14, y);
    }
    pg.endShape(CLOSE);
  }

  for (let k = 0; k < 7; k++) {
    pg.strokeWeight(1.2);
    pg.stroke(210, 255, 120, 42 + st5DoubtLevel * 35);
    pg.noFill();
    pg.beginShape();
    for (let y = 0; y <= height; y += 12) {
      let x =
        width / 2 +
        sin(y * 0.034 + st5T * 2.9 + k) * (6 + k * 3.2 + st5DoubtLevel * 8) +
        cos(y * 0.014 - st5T * 2.0 + k) * 10 +
        noise(k * 10, y * 0.012, st5T * 0.55) * (42 + st5DoubtLevel * 14) -
        21;
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
    let alpha = 12 + sin(st5T * 2.3 + i) * 5 + st5DoubtLevel * 8;

    pg.stroke(230, 255, 210, alpha);
    pg.strokeWeight(1);
    pg.beginShape();
    for (let x = 0; x <= width; x += 15) {
      let diag = (x + y) * 0.012;
      let yy =
        y +
        sin(diag + st5T * 2.2 + i) * 12 +
        cos((x - y) * 0.008 - st5T * 1.7) * 6 +
        noise(x * 0.012, i, st5T * 0.34) * 16 -
        8;
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
      sin(y * 0.024 + st5T * 3.8) * (15 + st5DoubtLevel * 20) +
      cos(y * 0.01 - st5T * 2.6) * 6 +
      noise(y * 0.012, st5T * 0.8) * (24 + st5DoubtLevel * 18) -
      12;
    let w = 14 + sin(st5T * 7 + i) * 5;
    let h = 4 + noise(i, st5T * 2.3) * 11;

    pg.fill(245, 255, 210, 16 + st5DoubtLevel * 16);
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

  tint(190, 255, 80, 10 + st5GlitchAmount * 70);
  image(src, -1.5 + sin(st5T * 8) * (0.8 + st5GlitchAmount * 4), -1);

  tint(90, 220, 255, 10 + st5GlitchAmount * 65);
  image(src, 1.5 + cos(st5T * 7) * (0.8 + st5GlitchAmount * 4), 1);

  tint(255, 220, 80, 8 + st5GlitchAmount * 40);
  image(
    src,
    sin(st5T * 3) * (0.5 + st5GlitchAmount * 2.5),
    cos(st5T * 4) * (0.5 + st5GlitchAmount * 2.5)
  );

  noTint();
  image(src, 0, 0);
  pop();

  let slices = floor(2 + st5GlitchAmount * 14);
  for (let i = 0; i < slices; i++) {
    if (random() < st5GlitchFreq) {
      let sy = floor(random(height));
      let sh = max(1, floor(random(6, 16 + st5GlitchAmount * 18)));
      let dx = floor(
        random(-8 - st5GlitchAmount * 22, 8 + st5GlitchAmount * 22)
      );
      let dy = floor(random(-2 - st5GlitchAmount * 5, 2 + st5GlitchAmount * 5));

      copy(src, 0, sy, width, sh, dx, sy + dy, width, sh);
    }
  }

  for (let i = 0; i < 5; i++) {
    if (random() < st5GlitchFreq * 0.8) {
      let sy = floor(random(height));
      let sh = max(1, floor(random(8, 18 + st5GlitchAmount * 14)));
      let sx = floor(width / 2 - random(45, 95));
      let sw = max(1, floor(random(90, 150 + st5GlitchAmount * 60)));
      let dx = floor(
        random(-8 - st5GlitchAmount * 16, 8 + st5GlitchAmount * 16)
      );
      let ddy = floor(random(-2, 2));

      copy(src, sx, sy, sw, sh, sx + dx, sy + ddy, sw, sh);
    }
  }

  noStroke();
  for (let y = 0; y < height; y += 3) {
    fill(0, 7 + st5GlitchAmount * 8);
    rect(0, y, width, 1);
  }

  if (
    frameCount % max(4, floor(18 - st5GlitchAmount * 10)) === 0 &&
    random() < st5GlitchFreq + 0.08
  ) {
    stroke(240, 255, 160, 10 + st5GlitchAmount * 28);
    strokeWeight(1);
    let streaks = floor(2 + st5GlitchAmount * 8);
    for (let i = 0; i < streaks; i++) {
      let x1 = random(width * 0.35, width * 0.65);
      let y1 = random(height);
      let len = random(16, 40 + st5GlitchAmount * 35);
      line(x1, y1, x1 + random(-10, 10), y1 + len);
    }
  }

  if (random() < 0.004 + st5GlitchFreq * 0.08) {
    fill(220, 255, 180, 5 + st5GlitchAmount * 12);
    rect(0, 0, width, height);
  }
}

class State5DriftParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.side = random() < 0.5 ? -1 : 1;
    this.x =
      this.side < 0
        ? random(width * 0.06, width * 0.44)
        : random(width * 0.56, width * 0.94);
    this.y = random(height);
    this.size = random(1.5, 5.5);
    this.speed = random(0.2, 1.0);
    this.offset = random(TWO_PI);
  }

  update() {
    this.y -= this.speed * st5MotionMultiplier;
    let attract = map(abs(this.x - width / 2), 0, width / 2, 1.0, 0.25);

    this.x +=
      sin(st5T * 2.4 + this.offset) * (22 + st5DoubtLevel * 12) +
      noise(this.offset, this.y * 0.005, st5T * 0.22) * 60 -
      30;

    this.x +=
      sin(st5T * 5 + this.offset) *
      attract *
      (1.3 + st5DoubtLevel * 1.2) *
      this.side *
      -1;

    if (this.y < -20 || this.x < -20 || this.x > width + 20) {
      this.reset();
      this.y = height + random(10, 100);
    }
  }

  display(pg) {
    pg.noStroke();
    if (this.side < 0) {
      pg.fill(
        red(st5LeftColorBottom),
        green(st5LeftColorBottom),
        blue(st5LeftColorBottom),
        52
      );
    } else {
      pg.fill(
        red(st5RightColorBottom),
        green(st5RightColorBottom),
        blue(st5RightColorBottom),
        52
      );
    }
    pg.ellipse(this.x, this.y, this.size);
  }
}

class State5Ribbon {
  constructor(i) {
    this.index = i;
    this.baseY = map(i, 0, 21, 0, height);
    this.seed = random(1000);
    this.thickness = random(14, 42);
  }

  update() {}

  display(pg) {
    let leftCol = color(
      red(st5LeftColorBottom),
      green(st5LeftColorBottom),
      blue(st5LeftColorBottom),
      24 + st5DoubtLevel * 10
    );
    let rightCol = color(
      red(st5RightColorBottom),
      green(st5RightColorBottom),
      blue(st5RightColorBottom),
      24 + st5DoubtLevel * 10
    );
    let bruisedCol = color(170, 110, 255, 12 + st5DoubtLevel * 10);

    pg.noStroke();
    pg.beginShape();

    for (let x = 0; x <= width; x += 16) {
      let splitBias = x < width / 2 ? 0 : 1;
      let wave =
        sin(x * 0.012 + st5T * (1.3 + 0.1 * this.index)) *
          (10 + st5MotionMultiplier * 4) +
        cos(x * 0.006 - st5T * 1.8 + this.seed) * (5 + st5DoubtLevel * 12) +
        noise(this.seed, x * 0.008, st5T * 0.2) * (24 + st5DoubtLevel * 24) -
        (12 + st5DoubtLevel * 12);
      let y = this.baseY + wave;
      if (splitBias === 0) pg.fill(leftCol);
      else pg.fill(rightCol);
      pg.vertex(x, y);
    }

    for (let x = width; x >= 0; x -= 16) {
      let wave =
        sin(x * 0.012 + st5T * (1.3 + 0.1 * this.index)) *
          (10 + st5MotionMultiplier * 4) +
        cos(x * 0.006 - st5T * 1.8 + this.seed) * (5 + st5DoubtLevel * 12) +
        noise(this.seed + 50, x * 0.008, st5T * 0.2) *
          (24 + st5DoubtLevel * 24) -
        (12 + st5DoubtLevel * 12) +
        this.thickness;
      let y = this.baseY + wave;
      pg.fill(bruisedCol);
      pg.vertex(x, y);
    }

    pg.endShape(CLOSE);
  }
}

class State5DoubtWord {
  constructor() {
    this.reset();
  }

  pickPhraseForEmotion() {
    const emotionPhrases = {
      happy: ["too bright", "that smile?", "uncertain joy", "not convincing"],
      angry: ["too much", "hostile?", "instability", "conflict found"],
      surprised: ["spike detected", "sudden shift", "too abrupt", "unexpected"],
      neutral: st5Phrases,
      fearful: [
        "signal unstable",
        "hesitation",
        "fear pattern",
        "are you sure",
      ],
      sad: ["dim response", "withdrawn", "low certainty", "fading"],
      disgusted: ["rejection detected", "mismatch", "aversion", "not aligned"],
    };
    let set = emotionPhrases[st5CurrentEmotion] || st5Phrases;
    return random(set);
  }

  reset() {
    this.text = this.pickPhraseForEmotion();
    this.baseX = random(width * 0.18, width * 0.82);
    this.baseY = random(height * 0.12, height * 0.88);
    this.x = this.baseX;
    this.y = this.baseY;
    this.size = random(12, 22);
    this.alpha = 0;
    this.maxAlpha = random(35, 95);
    this.life = floor(random(120, 240));
    this.phase = random(TWO_PI);
    this.seed = random(10000);
  }

  update() {
    this.life--;

    let diag = (this.baseX + this.baseY) * 0.003;
    this.x =
      this.baseX +
      sin(st5T * 2.0 + this.phase + diag) * 14 +
      noise(this.seed, st5T * 0.4) * 18 -
      9;
    this.y =
      this.baseY +
      cos(st5T * 1.6 + this.phase) * 7 +
      sin(st5T * 1.2 + diag) * 5;

    if (this.life > 120) {
      this.alpha = lerp(this.alpha, this.maxAlpha, 0.04);
    } else if (this.life < 50) {
      this.alpha *= 0.95;
    }

    if (this.life <= 0 || this.alpha < 2) this.reset();
  }

  display(pg) {
    if (random() < 0.18) return;

    pg.push();
    pg.textSize(this.size);
    pg.textStyle(NORMAL);

    let jitterX = random(-0.8, 0.8);
    let jitterY = random(-0.6, 0.6);

    pg.fill(90, 220, 255, this.alpha * 0.35);
    pg.text(this.text, this.x - 2 + jitterX, this.y + jitterY);

    pg.fill(220, 255, 120, this.alpha * 0.28);
    pg.text(this.text, this.x + 1.5 - jitterX, this.y - 1);

    pg.fill(245, 255, 230, this.alpha * 0.78);
    pg.text(this.text, this.x, this.y);

    if (random() < 0.02 + st5DoubtLevel * 0.03) {
      let w = pg.textWidth(this.text);
      pg.noStroke();
      pg.fill(255, 230, 80, this.alpha * 0.22);
      pg.rect(this.x - w * 0.25, this.y + 6, random(12, w * 0.35), 2);
    }

    pg.pop();
  }
}
//}

//---------------------------------------------------------------------------------------------------CONTROL------------------

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

  initState6Whispers();
  applyState6EmotionInstant("neutral");
}

function updateState6EmotionStyle() {
  st6MotionSpeed = lerp(st6MotionSpeed, st6TargetMotionSpeed, st6ControlLerp);
  st6PulseStrength = lerp(
    st6PulseStrength,
    st6TargetPulseStrength,
    st6ControlLerp
  );
  st6ScanSpeedBoost = lerp(
    st6ScanSpeedBoost,
    st6TargetScanSpeedBoost,
    st6ControlLerp
  );
  st6RuptureAmount = lerp(
    st6RuptureAmount,
    st6TargetRuptureAmount,
    st6ControlLerp
  );
  st6GlowStrength = lerp(
    st6GlowStrength,
    st6TargetGlowStrength,
    st6ControlLerp
  );

  st6BgColA = lerpColor(st6BgColA, st6TargetBgColA, st6ControlLerp);
  st6BgColB = lerpColor(st6BgColB, st6TargetBgColB, st6ControlLerp);
  st6SideColA = lerpColor(st6SideColA, st6TargetSideColA, st6ControlLerp);
  st6SideColB = lerpColor(st6SideColB, st6TargetSideColB, st6ControlLerp);
  st6HaloColA = lerpColor(st6HaloColA, st6TargetHaloColA, st6ControlLerp);
  st6HaloColB = lerpColor(st6HaloColB, st6TargetHaloColB, st6ControlLerp);
  st6CoreColA = lerpColor(st6CoreColA, st6TargetCoreColA, st6ControlLerp);
  st6CoreColB = lerpColor(st6CoreColB, st6TargetCoreColB, st6ControlLerp);
}

function applyState6EmotionInstant(emotionName) {
  let e = st6EmotionStyles[emotionName] || st6EmotionStyles.neutral;
  st6CurrentEmotion = emotionName;

  st6MotionSpeed = e.motionSpeed;
  st6TargetMotionSpeed = e.motionSpeed;
  st6PulseStrength = e.pulseStrength;
  st6TargetPulseStrength = e.pulseStrength;
  st6ScanSpeedBoost = e.scanSpeedBoost;
  st6TargetScanSpeedBoost = e.scanSpeedBoost;
  st6RuptureAmount = e.ruptureAmount;
  st6TargetRuptureAmount = e.ruptureAmount;
  st6GlowStrength = e.glowStrength;
  st6TargetGlowStrength = e.glowStrength;

  st6BgColA = color(...e.bgA);
  st6TargetBgColA = color(...e.bgA);
  st6BgColB = color(...e.bgB);
  st6TargetBgColB = color(...e.bgB);
  st6SideColA = color(...e.sideA);
  st6TargetSideColA = color(...e.sideA);
  st6SideColB = color(...e.sideB);
  st6TargetSideColB = color(...e.sideB);
  st6HaloColA = color(...e.haloA);
  st6TargetHaloColA = color(...e.haloA);
  st6HaloColB = color(...e.haloB);
  st6TargetHaloColB = color(...e.haloB);
  st6CoreColA = color(...e.coreA);
  st6TargetCoreColA = color(...e.coreA);
  st6CoreColB = color(...e.coreB);
  st6TargetCoreColB = color(...e.coreB);
}

function setState6Emotion(emotionName) {
  let e = st6EmotionStyles[emotionName] || st6EmotionStyles.neutral;
  st6CurrentEmotion = emotionName;

  st6TargetMotionSpeed = e.motionSpeed;
  st6TargetPulseStrength = e.pulseStrength;
  st6TargetScanSpeedBoost = e.scanSpeedBoost;
  st6TargetRuptureAmount = e.ruptureAmount;
  st6TargetGlowStrength = e.glowStrength;

  st6TargetBgColA = color(...e.bgA);
  st6TargetBgColB = color(...e.bgB);
  st6TargetSideColA = color(...e.sideA);
  st6TargetSideColB = color(...e.sideB);
  st6TargetHaloColA = color(...e.haloA);
  st6TargetHaloColB = color(...e.haloB);
  st6TargetCoreColA = color(...e.coreA);
  st6TargetCoreColB = color(...e.coreB);
}

// ── main draw entry ──────────────────────────────────────────
function drawState6() {
  updateState6EmotionStyle();

  noStroke();
  fill(0, 0, 0, 0 + sin(frameCount * 0.05) * 15);
  rect(0, 0, width, height);

  push();
  colorMode(RGB, 255, 255, 255, 255);

  let t = (millis() - st6T0) * 0.001 * st6MotionSpeed;
  let intensity = constrain(map(t, 0, 14, 0, 1), 0, 1);

  background(red(st6BgColA), green(st6BgColA), blue(st6BgColA), 0);

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

// ── atmosphere ───────────────────────────────────────────────

function drawState6ToxicVoid(t, intensity) {
  noStroke();

  for (let y = 0; y < height; y += 6) {
    let n1 = noise(y * 0.006, t * 0.08);
    let n2 = noise(200 + y * 0.012, t * 0.12);

    let r = red(st6BgColB) * 0.35 + 14 * n2;
    let g =
      green(st6BgColB) * 0.45 + 50 * n1 + 30 * intensity * st6GlowStrength;
    let b = blue(st6BgColB) * 0.25 + 10 * n2;

    fill(r, g, b, 22 + st6GlowStrength * 6);
    rect(0, y, width, 8);
  }

  for (let i = 0; i < 7; i++) {
    fill(
      red(st6SideColA),
      green(st6SideColA),
      blue(st6SideColA),
      4 + intensity * 5 * st6GlowStrength
    );
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
    fill(
      red(st6SideColB),
      green(st6SideColB),
      blue(st6SideColB),
      4 + intensity * 3 * st6GlowStrength
    );
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
    let alpha = map(layer, 0, 12, 24, 7) + intensity * 10 * st6GlowStrength;

    noFill();
    strokeWeight((1.4 + layer * 0.09) * st6PulseStrength);

    if (layer % 3 === 0)
      stroke(red(st6SideColA), green(st6SideColA), blue(st6SideColA), alpha);
    else if (layer % 3 === 1)
      stroke(
        red(st6SideColB),
        green(st6SideColB),
        blue(st6SideColB),
        alpha * 0.8
      );
    else
      stroke(
        red(st6HaloColA),
        green(st6HaloColA),
        blue(st6HaloColA),
        alpha * 0.65
      );

    beginShape();
    for (let a = 0; a <= TWO_PI + 0.045; a += 0.045) {
      let n = noise(
        30 + cos(a) * 0.95 + layer * 0.1,
        60 + sin(a) * 0.95 + layer * 0.1,
        t * (0.16 + layer * 0.008) * st6PulseStrength
      );

      let eyeStretch =
        pow(abs(cos(a)), 1.35) *
        scaleR *
        0.24 *
        (0.4 + intensity * 1.1) *
        st6PulseStrength;
      let pinch = pow(abs(sin(a)), 1.7) * scaleR * 0.1;
      let warp = map(n, 0, 1, -scaleR * 0.09, scaleR * 0.09);
      let wave =
        sin(
          a * (6 + layer * 0.16) + t * (1.1 + layer * 0.09) * st6PulseStrength
        ) *
        scaleR *
        0.028 *
        st6PulseStrength;

      let rr = scaleR + warp + wave + eyeStretch - pinch;
      vertex(cos(a) * rr, sin(a) * rr * (0.62 + 0.03 * sin(t + layer)));
    }
    endShape(CLOSE);
  }

  pop();
}

function drawState6Halos(t, intensity) {
  noStroke();

  for (let h of st6Halos) {
    let rr = h.radius + sin(t * 0.35 * st6PulseStrength + h.seed) * 48;
    let cx = width / 2 + cos(h.a + t * 0.11 * st6PulseStrength) * rr;
    let cy = height / 2 + sin(h.a + t * 0.11 * st6PulseStrength) * rr * 0.5;

    for (let i = 0; i < 9; i++) {
      let ang = t * 0.28 * st6PulseStrength + i * 0.7 + h.seed;
      let sx = cx + cos(ang) * (24 + i * 18);
      let sy = cy + sin(ang) * (8 + i * 8) * 0.72;
      let w = 130 + i * 18;
      let hh = 26 + i * 7;

      fill(
        red(st6HaloColA),
        green(st6HaloColA),
        blue(st6HaloColA),
        4 + intensity * 4 * st6GlowStrength
      );
      ellipse(sx, sy, w, hh);

      fill(
        red(st6HaloColB),
        green(st6HaloColB),
        blue(st6HaloColB),
        3 + intensity * 3 * st6GlowStrength
      );
      ellipse(sx, sy, w * 0.72, hh * 0.82);
    }
  }
}

function drawState6CentralPredator(t, intensity) {
  push();
  translate(width / 2, height / 2);
  noStroke();

  for (let i = 0; i < 16; i++) {
    let w =
      360 -
      i * 14 +
      sin(t * 1.4 * st6PulseStrength + i) * (10 * st6PulseStrength);
    let h =
      126 -
      i * 4 +
      cos(t * 1.15 * st6PulseStrength + i) * (6 * st6PulseStrength);
    fill(
      red(st6CoreColA) * 0.5 + i * 2,
      green(st6CoreColA) * 0.7 + i * 2,
      blue(st6CoreColA) * 0.25 + 24,
      6
    );
    ellipse(0, 0, w, h);
  }

  for (let i = 0; i < 20; i++) {
    let ang = map(i, 0, 19, 0, TWO_PI);
    let x = cos(ang + t * 0.18 * st6PulseStrength) * (76 * st6PulseStrength);
    let y = sin(ang + t * 0.18 * st6PulseStrength) * 22;

    fill(
      red(st6CoreColA),
      green(st6CoreColA),
      blue(st6CoreColA),
      11 * st6GlowStrength
    );
    ellipse(x, y, 85, 24);

    fill(
      red(st6CoreColB) * 0.4,
      green(st6CoreColB),
      blue(st6CoreColB),
      7 * st6GlowStrength
    );
    ellipse(x * 0.8, y * 0.8, 50, 14);
  }

  fill(5, 10, 6, 140);
  ellipse(
    0,
    0,
    54 + sin(t * 2.8 * st6PulseStrength) * 4,
    108 + cos(t * 2.4 * st6PulseStrength) * 6
  );

  fill(
    red(st6CoreColA),
    green(st6CoreColA),
    blue(st6CoreColA),
    15 + intensity * 12 * st6GlowStrength
  );
  ellipse(
    0,
    0,
    190 + sin(t * 4 * st6PulseStrength) * 12,
    50 + cos(t * 3.6 * st6PulseStrength) * 7
  );

  fill(red(st6CoreColB), green(st6CoreColB), blue(st6CoreColB), 8);
  ellipse(20, -12, 26, 8);

  pop();
}

function drawState6Veins(t, intensity) {
  noFill();

  for (let v of st6Veins) {
    let d = dist(v.x, v.y, width / 2, height / 2);
    let centerPull = constrain(1.0 - d / (min(width, height) * 0.6), 0, 1);

    strokeWeight(v.thick * (0.7 + centerPull * 0.8) * st6PulseStrength);

    if (random() < 0.5) {
      stroke(
        red(st6SideColA),
        green(st6SideColA),
        blue(st6SideColA),
        10 + centerPull * 18 * st6GlowStrength
      );
    } else {
      stroke(
        red(st6SideColB),
        green(st6SideColB),
        blue(st6SideColB),
        8 + centerPull * 14 * st6GlowStrength
      );
    }

    beginShape();
    for (let i = 0; i < 6; i++) {
      let px = v.x + i * v.len * 0.18;
      let py =
        v.y +
        sin(t * v.speed * st6MotionSpeed + i * 0.8 + v.seed) *
          v.len *
          0.12 *
          st6PulseStrength +
        map(noise(v.seed, i * 0.2, t * 0.2), 0, 1, -18, 18);
      curveVertex(px, py);
    }
    endShape();

    if (
      random() <
      0.02 + centerPull * 0.04 + intensity * 0.03 * st6RuptureAmount
    ) {
      stroke(red(st6CoreColB), green(st6CoreColB), blue(st6CoreColB), 16);
      line(v.x, v.y, v.x + random(-25, 25), v.y + random(-25, 25));
    }
  }
}

function drawState6WormField(t, intensity) {
  noFill();

  for (let w of st6Worms) {
    let cx = w.x + sin(t * w.speed * st6MotionSpeed + w.seed) * 30;
    let cy = w.y + cos(t * w.speed * 0.8 * st6MotionSpeed + w.seed) * 16;

    strokeWeight((1.2 + intensity * 0.7) * st6PulseStrength);
    stroke(
      red(st6HaloColA),
      green(st6HaloColA),
      blue(st6HaloColA),
      10 + intensity * 10 * st6GlowStrength
    );

    beginShape();
    for (let i = 0; i < 8; i++) {
      let px = cx + map(i, 0, 7, -w.len * 0.5, w.len * 0.5);
      let py =
        cy +
        sin(i * 0.9 + t * 2.2 * st6MotionSpeed + w.seed) *
          w.amp *
          st6PulseStrength;
      curveVertex(px, py);
    }
    endShape();

    if (random() < 0.03 + intensity * 0.04 * st6RuptureAmount) {
      stroke(red(st6HaloColB), green(st6HaloColB), blue(st6HaloColB), 12);
      line(cx - w.len * 0.2, cy, cx + w.len * 0.2, cy + random(-12, 12));
    }
  }
}

function drawState6ScanSlices(t, intensity) {
  noStroke();

  for (let s of st6Slices) {
    let xx =
      ((s.x +
        sin(t * s.speed * st6ScanSpeedBoost + s.seed) * width * 0.32 +
        width) %
        (width + s.w)) -
      s.w;
    let ww = s.w * (0.8 + noise(s.seed, t * 0.32 * st6ScanSpeedBoost) * 0.7);

    fill(
      red(st6SideColA),
      green(st6SideColA),
      blue(st6SideColA),
      8 + intensity * 7 * st6GlowStrength
    );
    rect(xx, 0, ww, height);

    fill(
      red(st6CoreColB),
      green(st6CoreColB),
      blue(st6CoreColB),
      4 + intensity * 5 * st6GlowStrength
    );
    rect(xx + ww * 0.4, 0, ww * 0.08, height);
  }
}

function drawState6Ruptures(t, intensity) {
  noStroke();

  for (let r of st6Ruptures) {
    let shift =
      sin(t * r.speed * st6MotionSpeed + r.seed) *
      36 *
      intensity *
      st6RuptureAmount;
    let wobble =
      noise(r.seed, t * 0.7 * st6MotionSpeed) * 40 * st6RuptureAmount;

    if (random() < 0.18 + intensity * 0.2 * st6RuptureAmount) {
      fill(
        red(st6CoreColB),
        green(st6CoreColB),
        blue(st6CoreColB),
        7 + intensity * 7 * st6GlowStrength
      );
      rect(shift - 25, r.y, width + wobble, r.h);
    }

    if (random() < 0.14 + intensity * 0.16 * st6RuptureAmount) {
      fill(
        red(st6SideColA),
        green(st6SideColA),
        blue(st6SideColA),
        10 + intensity * 10 * st6GlowStrength
      );
      rect(
        shift + random(-18, 18),
        r.y + random(-2, 2),
        width + random(-50, 50),
        r.h * random(0.6, 1.3)
      );
    }

    if (random() < 0.12 + intensity * 0.14 * st6RuptureAmount) {
      fill(
        red(st6SideColB),
        green(st6SideColB),
        blue(st6SideColB),
        8 + intensity * 8 * st6GlowStrength
      );
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
    m.x += (m.dx + sin(t * 0.9 + m.seed) * 0.18) * st6MotionSpeed;
    m.y += (m.dy + cos(t * 0.7 + m.seed) * 0.18) * st6MotionSpeed;

    if (m.x < -10) m.x = width + 10;
    if (m.x > width + 10) m.x = -10;
    if (m.y < -10) m.y = height + 10;
    if (m.y > height + 10) m.y = -10;

    let d = dist(m.x, m.y, width / 2, height / 2);
    let centerGlow = constrain(1.0 - d / (min(width, height) * 0.58), 0, 1);

    fill(
      red(st6CoreColB),
      green(st6CoreColB),
      blue(st6CoreColB),
      8 + centerGlow * 12 * st6GlowStrength
    );
    ellipse(m.x, m.y, m.r);

    if (random() < 0.016 + centerGlow * 0.035 * st6GlowStrength) {
      fill(red(st6SideColA), green(st6SideColA), blue(st6SideColA), 18);
      ellipse(m.x, m.y, m.r + 2);
    }
  }
}

// ── text / whispers ──────────────────────────────────────────

let st6ControlPhrases = [
  "stabilizing...",
  "adjusting...",
  "realigning...",
  "correcting deviation",
  "maintain consistency",
  "you are being adjusted",
  "recalibrating response",
  "error minimized",
  "variance reduced",
  "this is better",
  "do not resist",
  "you are within range",
];

let st6DisplayedWhispers = [];
let st6WhisperChangeInterval = 10000;
let st6LastWhisperChange = 0;

function initState6Whispers() {
  st6DisplayedWhispers = [];
  let count = 14;
  let used = [];

  for (let i = 0; i < count; i++) {
    let phrase,
      tries = 0;
    do {
      phrase = random(st6ControlPhrases);
      tries++;
    } while (used.includes(phrase) && tries < 20);
    used.push(phrase);

    let ang = random(TWO_PI);
    let distX = random(width * 0.12, width * 0.32);
    let distY = random(height * 0.07, height * 0.18);

    st6DisplayedWhispers.push({
      phrase,
      baseAngle: ang,
      baseRX: distX,
      baseRY: distY,
      driftSeed: random(10000),
      jitterSeed: random(10000),
      glitchSeed: random(10000),
      zoneBias: random([-1, 1]),
      size: random(12, 17),
    });
  }

  st6LastWhisperChange = millis();
}

function updateState6Whispers() {
  if (millis() - st6LastWhisperChange > st6WhisperChangeInterval) {
    initState6Whispers();
  }
}

function getState6GlitchText(str, amt = 0.18) {
  let chars = str.split("");
  let glitchPool = [
    "#",
    "/",
    "\\",
    "|",
    "_",
    "-",
    "=",
    "+",
    ":",
    ";",
    ".",
    "*",
  ];

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== " " && random() < amt) {
      chars[i] = random() < 0.65 ? random(glitchPool) : chars[i].toUpperCase();
    }
  }
  return chars.join("");
}

function drawState6AggressiveWhispers(t, intensity) {
  updateState6Whispers();

  textAlign(CENTER, CENTER);
  noStroke();

  let cx0 = width / 2;
  let cy0 = height / 2;

  for (let i = 0; i < st6DisplayedWhispers.length; i++) {
    let w = st6DisplayedWhispers[i];

    let slowWobbleA = sin(t * 0.55 + w.driftSeed) * 0.9;
    let slowWobbleB = cos(t * 0.43 + w.driftSeed * 1.3) * 0.7;
    let unstableAngle = w.baseAngle + slowWobbleA * 0.45 + slowWobbleB * 0.25;

    let rx =
      w.baseRX +
      sin(t * 0.9 + w.driftSeed * 0.8) * 26 +
      cos(t * 1.3 + w.driftSeed) * 10;
    let ry =
      w.baseRY +
      cos(t * 1.0 + w.driftSeed * 0.7) * 18 +
      sin(t * 1.6 + w.driftSeed) * 8;

    let x = cx0 + cos(unstableAngle) * rx;
    let y = cy0 + sin(unstableAngle) * ry;

    let jitterX =
      sin(t * 6.5 + w.jitterSeed) * 6 +
      sin(t * 11.0 + w.jitterSeed * 1.7) * 3 +
      random(-2.4, 2.4) * (0.5 + intensity * 0.8);
    let jitterY =
      cos(t * 7.3 + w.jitterSeed * 1.2) * 5 +
      cos(t * 12.6 + w.jitterSeed * 1.5) * 2.5 +
      random(-2.2, 2.2) * (0.5 + intensity * 0.8);

    x += jitterX + w.zoneBias * sin(t * 1.8 + w.driftSeed) * 10;
    y += jitterY;

    let phraseToDraw = w.phrase;
    if (random() < 0.1 + intensity * 0.18) {
      phraseToDraw = getState6GlitchText(phraseToDraw, 0.12 + intensity * 0.15);
    }

    let alpha =
      70 +
      sin(t * 4.2 + w.glitchSeed) * 30 +
      sin(t * 9.7 + w.glitchSeed * 1.4) * 18;
    if (random() < 0.08) alpha += 40;
    alpha = constrain(alpha, 35, 145);

    textSize(w.size);

    push();
    translate(x, y);
    rotate(sin(t * 2.2 + w.driftSeed) * 0.08 + random(-0.03, 0.03));

    if (random() < 0.28) {
      fill(255, 70, 70, alpha * 0.4);
      text(phraseToDraw, -3 + random(-2, 2), random(-1, 1));
      fill(80, 255, 180, alpha * 0.32);
      text(phraseToDraw, 3 + random(-2, 2), random(-1, 1));
    }

    fill(red(st6HaloColA), green(st6HaloColA), blue(st6HaloColA), alpha);
    text(phraseToDraw, 0, 0);

    if (random() < 0.1) {
      fill(
        red(st6CoreColB),
        green(st6CoreColB),
        blue(st6CoreColB),
        alpha * 0.45
      );
      text(phraseToDraw, random(-4, 4), random(-3, 3));
    }

    pop();
  }
}

function drawState6CrushFrame(intensity) {
  noFill();

  for (let i = 0; i < 18; i++) {
    stroke(0, 0, 0, 8 + i * 2 + intensity * 6);
    rect(i * 6, i * 6, width - i * 12, height - i * 12);
  }
}

function windowResizedState6() {
  initState6Scene();
}

//---------------------------------------------------------------------------------------------ESCALATION---------------------

function makeState7Buffer() {
  st7Buf = createGraphics(st7BUF_W, st7BUF_H);
  st7Buf.pixelDensity(1);
  let ctx = st7Buf.canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
}

function setState7Emotion(emotionName) {
  st7EmotionMode = emotionName || "neutral";
  st7CurrentProfile =
    st7EmotionProfiles[st7EmotionMode] || st7EmotionProfiles.neutral;
}

function restartState7() {
  st7T0 = millis();
  st7Intensity = 0;
  st7WhiteFlash = 0;
  initState7SlidePhrases();
}

function initState7SlidePhrases() {
  st7SlidePhrases = [];
  let startCount = 8;
  if (st7EmotionMode === "angry") startCount = 12;
  else if (st7EmotionMode === "surprised") startCount = 11;
  else if (st7EmotionMode === "fearful") startCount = 10;
  else if (st7EmotionMode === "sad") startCount = 6;
  else if (st7EmotionMode === "disgusted") startCount = 9;

  for (let i = 0; i < startCount; i++) {
    st7SlidePhrases.push(makeState7SlidePhrase(true));
  }
}

function makeState7SlidePhrase(randomSpawn = false) {
  let dir = random() < 0.5 ? 1 : -1;
  if (st7EmotionMode === "angry") dir = random() < 0.72 ? 1 : -1;
  if (st7EmotionMode === "sad") dir = random() < 0.8 ? -1 : 1;

  let yBand = random(height * 0.08, height * 0.92);

  let speed = random(14, 28);
  if (st7EmotionMode === "happy") speed = random(12, 24);
  else if (st7EmotionMode === "angry") speed = random(26, 48);
  else if (st7EmotionMode === "surprised") speed = random(22, 46);
  else if (st7EmotionMode === "neutral") speed = random(16, 30);
  else if (st7EmotionMode === "fearful") speed = random(18, 34);
  else if (st7EmotionMode === "sad") speed = random(8, 16);
  else if (st7EmotionMode === "disgusted") speed = random(16, 32);

  let size = random(14, 24);
  if (st7EmotionMode === "angry") size = random(16, 28);
  if (st7EmotionMode === "surprised") size = random(15, 30);
  if (st7EmotionMode === "sad") size = random(13, 20);

  let txt = random(ST7_ESCALATION_PHRASES);
  let x = dir > 0 ? -random(120, 700) : width + random(120, 700);
  if (randomSpawn) x = random(-width * 0.25, width * 1.25);

  return {
    txt,
    x,
    y: yBand,
    dir,
    speed,
    size,
    alpha: random(90, 180),
    thickness: random(14, 34),
    life: random(18, 42),
    stretch: random(1.2, 2.8),
    phase: random(TWO_PI),
    glitchAmt: random(0.04, 0.18),
    flashState: random() < 0.5,
    angle: random(-0.02, 0.02),
  };
}

function getState7FlashGlitchText(str, amt = 0.12) {
  let chars = str.split("");
  let pool = ["#", "/", "\\\\", "|", "_", "-", "=", "+", ":", ";"];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== " " && random() < amt) {
      chars[i] = random() < 0.7 ? random(pool) : chars[i];
    }
  }
  return chars.join("");
}

function estimateState7TextWidth(txt, size) {
  return txt.length * size * 0.62;
}

function updateState7SlidePhrases(t, k) {
  let spawnChance = 0.08 + 0.12 * k;
  if (st7EmotionMode === "angry") spawnChance += 0.08;
  if (st7EmotionMode === "surprised") spawnChance += 0.1;
  if (st7EmotionMode === "fearful") spawnChance += 0.05;
  if (st7EmotionMode === "sad") spawnChance *= 0.55;
  if (st7EmotionMode === "disgusted") spawnChance += 0.03;

  if (random() < spawnChance && st7SlidePhrases.length < 20) {
    st7SlidePhrases.push(makeState7SlidePhrase(false));
  }

  for (let i = st7SlidePhrases.length - 1; i >= 0; i--) {
    let s = st7SlidePhrases[i];
    let move = s.speed * (0.55 + 1.2 * k);

    if (st7EmotionMode === "angry") move *= 1.2;
    if (st7EmotionMode === "surprised" && random() < 0.1)
      move *= random(1.3, 2.2);
    if (st7EmotionMode === "sad") move *= 0.65;
    if (st7EmotionMode === "disgusted") move *= 0.95 + noise(t, s.phase) * 0.25;

    s.x += move * s.dir;
    s.life -= 1;
    if (random() < 0.25) s.flashState = !s.flashState;

    if (st7EmotionMode === "angry") {
      s.y += random(-1.5, 1.5);
      s.angle += random(-0.01, 0.01);
    } else if (st7EmotionMode === "surprised") {
      s.y += random(-2.5, 2.5);
      s.x += random(-10, 10) * 0.2;
    } else if (st7EmotionMode === "fearful") {
      s.y += sin(t * 10 + s.phase) * 1.2;
    } else if (st7EmotionMode === "sad") {
      s.y += 0.12;
    } else if (st7EmotionMode === "disgusted") {
      s.y += random(-1.4, 1.4);
      s.angle += random(-0.004, 0.004);
    }

    let w = estimateState7TextWidth(s.txt, s.size) * s.stretch;
    if (s.x < -w - 200 || s.x > width + w + 200 || s.life <= 0) {
      st7SlidePhrases.splice(i, 1);
    }
  }
}

function drawState7SlidePhrases(t, k) {
  textAlign(LEFT, CENTER);
  noStroke();

  for (let s of st7SlidePhrases) {
    let txt = s.txt;
    if (random() < s.glitchAmt + k * 0.08) {
      txt = getState7FlashGlitchText(txt, s.glitchAmt + k * 0.05);
    }

    let a = s.flashState ? s.alpha : s.alpha * random(0.08, 0.32);
    a *= 0.55 + 0.9 * k;
    a = constrain(a, 0, 255);

    push();
    translate(s.x, s.y);
    rotate(s.angle);

    rectMode(CORNER);
    fill(255, 255, 255, a * 0.14 * 0.35);
    rect(-width, -s.thickness * 0.18, width * 3, s.thickness * 0.36);

    textSize(s.size);
    scale(s.stretch, 1);

    if (st7EmotionMode === "angry") {
      fill(255, 70, 70, a * 0.35);
      text(txt, -10, 0);
      fill(255, 255, 255, a);
      text(txt, random(-2, 2), random(-1, 1));
    } else if (st7EmotionMode === "surprised") {
      fill(255, 220, 120, a * 0.26);
      text(txt, -12, 0);
      fill(255, 90, 90, a * 0.22);
      text(txt, 10, 0);
      fill(255, 255, 255, a);
      text(txt, random(-3, 3), random(-2, 2));
    } else if (st7EmotionMode === "fearful") {
      fill(235, 220, 255, a * 0.22);
      text(txt, -8, 0);
      fill(255, 80, 120, a * 0.18);
      text(txt, 8, 0);
      fill(255, 255, 255, a);
      text(txt, random(-2, 2), random(-2, 2));
    } else if (st7EmotionMode === "sad") {
      fill(180, 180, 210, a * 0.18);
      text(txt, -5, 0);
      fill(235, 235, 245, a * 0.9);
      text(txt, 0, 0);
    } else if (st7EmotionMode === "disgusted") {
      fill(255, 90, 90, a * 0.18);
      text(txt, -8, 0);
      fill(240, 255, 180, a * 0.14);
      text(txt, 8, 0);
      fill(255, 248, 228, a);
      text(txt, random(-2, 2), random(-1, 1));
    } else {
      fill(255, 0, 110, a * 0.18);
      text(txt, -8, 0);
      fill(255, 255, 255, a);
      text(txt, 0, 0);
    }

    if (random() < 0.08 + k * 0.08) {
      fill(255, 255, 255, a * 0.12);
      text(txt, random(-18, 18), random(-6, 6));
    }

    pop();
  }
}

function drawState7() {
  let p = st7CurrentProfile || st7EmotionProfiles.neutral;

  noStroke();
  fill(0, 0, 0, 175 + sin(frameCount * 0.05) * 60);
  rect(0, 0, width, height);

  push();
  colorMode(RGB, 255, 255, 255, 255);

  let t = ((millis() - st7T0) / 1000) * p.speedMul;

  let ramp = 1.0 - exp(-t * 0.22 * p.rampMul);
  let spike = pow(constrain((t - 6.0) / 10.0, 0, 1), 1.75);
  st7Intensity = constrain(
    0.12 + 0.62 * ramp + 0.3 * spike + 0.04 * sin(t * (2.6 + 0.3 * p.speedMul)),
    0,
    1
  );

  if (st7EmotionMode === "angry")
    st7Intensity = constrain(st7Intensity + 0.04 * sin(t * 10.0), 0, 1);
  if (st7EmotionMode === "surprised")
    st7Intensity = constrain(
      st7Intensity + (random() < 0.05 ? random(-0.05, 0.1) : 0),
      0,
      1
    );
  if (st7EmotionMode === "fearful")
    st7Intensity = constrain(
      st7Intensity + 0.035 * sin(t * 14.0) * random(0.7, 1.2),
      0,
      1
    );
  if (st7EmotionMode === "sad")
    st7Intensity = constrain(st7Intensity - 0.02 * abs(sin(t * 1.7)), 0, 1);
  if (st7EmotionMode === "disgusted")
    st7Intensity = constrain(st7Intensity + 0.02 * noise(t * 0.9, 111), 0, 1);

  let flashChance = (0.01 + 0.08 * pow(st7Intensity, 2.1)) * p.flashMul;
  if (st7EmotionMode === "surprised")
    flashChance += 0.02 * max(0, sin(t * 6.5));
  if (st7EmotionMode === "fearful") flashChance += 0.012 * noise(t * 4.0, 777);

  if (random() < flashChance) st7WhiteFlash = 255;
  if (st7WhiteFlash > 0) st7WhiteFlash -= 42 + 26 * st7Intensity;

  let shakeBase = pow(st7Intensity, 1.35) * 22 * p.shakeMul;
  let sx = 0,
    sy = 0;

  if (st7EmotionMode === "happy") {
    sx = random(-shakeBase, shakeBase) * 0.65 + sin(t * 4.8) * 5 * st7Intensity;
    sy = random(-shakeBase, shakeBase) * 0.65 + cos(t * 4.2) * 4 * st7Intensity;
  } else if (st7EmotionMode === "angry") {
    sx = random(-shakeBase, shakeBase);
    sy = random(-shakeBase, shakeBase);
  } else if (st7EmotionMode === "surprised") {
    sx =
      random(-shakeBase, shakeBase) +
      (random() < 0.07 ? random(-16, 16) * st7Intensity : 0);
    sy =
      random(-shakeBase, shakeBase) +
      (random() < 0.07 ? random(-12, 12) * st7Intensity : 0);
  } else if (st7EmotionMode === "fearful") {
    sx =
      random(-shakeBase, shakeBase) * 0.85 + sin(t * 17.0) * 3.5 * st7Intensity;
    sy =
      random(-shakeBase, shakeBase) * 0.85 + cos(t * 18.0) * 3.5 * st7Intensity;
  } else if (st7EmotionMode === "sad") {
    sx = random(-shakeBase, shakeBase) * 0.45;
    sy = random(-shakeBase, shakeBase) * 0.45 + 2 * sin(t * 1.2) * st7Intensity;
  } else if (st7EmotionMode === "disgusted") {
    sx =
      random(-shakeBase, shakeBase) * 0.55 +
      noise(t * 1.4, 21) * 10 * st7Intensity -
      5 * st7Intensity;
    sy =
      random(-shakeBase, shakeBase) * 0.55 +
      noise(t * 1.2, 84) * 8 * st7Intensity -
      4 * st7Intensity;
  } else {
    sx = random(-shakeBase, shakeBase);
    sy = random(-shakeBase, shakeBase);
  }

  st7RenderToggle = !st7RenderToggle;
  if (st7Intensity > 0.35 || st7RenderToggle) {
    renderState7EscalationField(st7Buf, t, st7Intensity, st7WhiteFlash, p);
  }

  updateState7SlidePhrases(t, st7Intensity);

  push();
  translate(sx, sy);
  image(st7Buf, 0, 0, width, height);
  drawState7SlidePhrases(t, st7Intensity);
  pop();

  pop();

  drawBox(color(255, 92, 0));
}

function renderState7EscalationField(g, t, k, flash, p) {
  g.loadPixels();

  let tearStrength = (1.0 + 9.5 * pow(k, 1.6)) * p.glitchMul;
  let shutterY = ((t * (36 + 110 * k * p.speedMul)) % (g.height + 50)) - 25;
  let step = max(2, floor(7 - 3 * k));

  for (let y = 0; y < g.height; y++) {
    let rip =
      random() < 0.009 * k * p.glitchMul
        ? random(-1, 1) * 70 * k * p.glitchMul
        : 0;
    let wave =
      sin(y * 0.06 + t * (1.5 + 4.7 * k * p.speedMul)) * (5 + 45 * pow(k, 1.5));
    let tear = (wave + rip) * tearStrength;

    if (st7EmotionMode === "surprised" && random() < 0.06 * k)
      tear += random(-40, 40) * k;
    if (st7EmotionMode === "fearful") tear += sin(t * 13 + y * 0.09) * 5 * k;
    if (st7EmotionMode === "disgusted")
      tear += noise(y * 0.05, t * 0.9) * 20 * k - 10 * k;

    let scan =
      0.84 +
      0.16 * sin(y * (0.25 + 0.2 * k) + t * (5.2 + 10.0 * k * p.speedMul));
    let dy = abs(y - shutterY);
    let shutter = 1.0 - smoothstep(0, 38 + 70 * k, dy) * (0.35 + 0.32 * k);
    let stripe = y % step === 0 ? 1.0 : 0.0;
    let redLineBoost =
      stripe *
      (0.35 + 0.65 * (0.5 + 0.5 * sin(t * 2.0 + y * 0.18))) *
      (14 + 42 * k);

    for (let x = 0; x < g.width; x++) {
      let wx = x + tear;
      let nx = wx * ST7_BASE_SCALE;
      let ny = y * ST7_BASE_SCALE;

      let field = buildState7EmotionField(nx, ny, t, k, p);
      let base = field.base;
      let hot = field.hot;
      let accent = field.accent;
      let contam = field.contam;

      let red = 16 + 225 * pow(base, 1.14);
      let green =
        2 + 32 * pow(accent, 1.35) * (0.12 + 0.88 * k) * (0.1 + 0.9 * hot);
      let blue = 1 + 16 * pow(accent, 1.55) * (0.07 + 0.55 * k);

      red *= scan * shutter;
      green *= scan * shutter;
      blue *= scan * shutter;

      red *= p.redMul;
      green *= p.greenMul;
      blue *= p.blueMul;

      if (st7EmotionMode === "happy") {
        red += 10 * field.ring;
        blue += 12 * field.ring;
      } else if (st7EmotionMode === "angry") {
        red += 30 * field.vein + 14 * field.shred;
        green *= 0.75;
        blue *= 0.65;
      } else if (st7EmotionMode === "surprised") {
        red += 16 * field.ring + 10 * field.pulse;
        green += 10 * field.ring;
      } else if (st7EmotionMode === "fearful") {
        blue += 16 * field.vein;
      } else if (st7EmotionMode === "sad") {
        red *= 0.88;
        green *= 0.84;
        blue *= 0.9;
        blue += 5 * field.droop;
      } else if (st7EmotionMode === "disgusted") {
        green += 22 * contam;
        red *= 0.96;
      }

      red = clamp255(red + redLineBoost);

      if (flash > 0) {
        let f = flash / 255;
        red = red * (1 - 0.85 * f) + p.flashTintR * (0.85 * f);
        green = green * (1 - 0.85 * f) + p.flashTintG * (0.85 * f);
        blue = blue * (1 - 0.85 * f) + p.flashTintB * (0.85 * f);
      }

      let idx = 4 * (x + y * g.width);
      g.pixels[idx + 0] = clamp255(red);
      g.pixels[idx + 1] = clamp255(green);
      g.pixels[idx + 2] = clamp255(blue);
      g.pixels[idx + 3] = 255;
    }
  }

  smearState7PixelsEmotion(g, t, k, p);
  g.updatePixels();
}

function buildState7EmotionField(nx, ny, t, k, p) {
  let n1 = noise(nx + t * 0.25, ny);
  let n2 = noise(nx * 2.0 - t * 0.33, ny * 2.0 + 9.0);
  let n3 = noise(nx * 0.7 + 100.0, ny * 0.7 + t * 0.12);
  let n4 = noise(nx * 3.0 - 30.0, ny * 3.0 + t * 0.5);

  let vein = abs(sin(nx * 9.0 + n2 * 3.0 + t * (1.0 + 2.5 * p.structure)));
  vein = pow(1.0 - vein, 3.0) * p.veinAmp;

  let cx = nx - 1.0 + 0.18 * sin(t * 0.8);
  let cy = ny - 0.7 + 0.12 * cos(t * 0.6);
  let rr = sqrt(cx * cx + cy * cy);
  let ring = 0.5 + 0.5 * sin(rr * 24.0 - t * (5.0 + 6.0 * p.structure));
  ring = pow(max(0, ring), 2.2) * p.ringAmp;

  let shred = noise(nx * 8.0 + t * 2.8, ny * 1.4 - t * 0.8);
  shred = smoothstep(0.68, 0.95, shred) * p.shredAmp;

  let pulse = 0.5 + 0.5 * sin((nx + ny) * 10.0 + t * (4.0 + 5.0 * p.structure));
  pulse = pow(pulse, 2.0) * p.pulseAmp;

  let droop = noise(nx * 1.3, ny * 0.5 + t * 0.08);
  droop *= smoothstep(0.0, 1.0, ny / (st7BUF_H * ST7_BASE_SCALE + 0.0001));
  droop *= p.droopAmp;

  let contam = noise(nx * 2.6 + 300.0, ny * 2.2 + t * 0.9);
  contam = smoothstep(0.45, 0.9, contam) * p.contaminationAmp;

  let base = 0.68 * pow(n1, 1.18) + 0.32 * pow(n2, 1.05);

  if (st7EmotionMode === "happy")
    base += 0.45 * ring + 0.22 * pulse + 0.08 * vein;
  else if (st7EmotionMode === "angry")
    base += 0.48 * vein + 0.35 * shred + 0.14 * pulse;
  else if (st7EmotionMode === "surprised")
    base += 0.58 * ring + 0.26 * pulse + 0.1 * shred;
  else if (st7EmotionMode === "neutral")
    base += 0.28 * vein + 0.18 * ring + 0.18 * shred + 0.14 * pulse;
  else if (st7EmotionMode === "fearful")
    base += 0.52 * vein + 0.12 * ring + 0.1 * pulse;
  else if (st7EmotionMode === "sad")
    base += 0.3 * droop + 0.12 * contam + 0.08 * ring;
  else if (st7EmotionMode === "disgusted")
    base += 0.28 * shred + 0.36 * contam + 0.08 * droop;

  let hot = smoothstep(0.62 - 0.1 * k, 0.92, n3 + 0.25 * pulse + 0.18 * shred);
  let accent = constrain(0.45 * n2 + 0.25 * vein + 0.2 * ring + 0.1 * n4, 0, 1);

  base *= 0.78 + 0.55 * hot * k;
  base = constrain(base, 0, 1);

  return { base, hot, accent, vein, ring, shred, pulse, droop, contam };
}

function smearState7PixelsEmotion(g, t, k, p) {
  if (k < 0.22) return;

  let W = g.width;
  let H = g.height;
  let smears = floor((2 + 14 * pow(k, 1.5)) * p.smearMul);

  for (let s = 0; s < smears; s++) {
    let y = floor(random(H));
    let segW = floor(random(W * 0.1, W * (0.32 + 0.25 * k)));
    let x0 = floor(random(0, max(1, W - segW)));
    let shift = floor(random(-1, 1) * (6 + 85 * pow(k, 1.7)) * p.glitchMul);

    if (st7EmotionMode === "happy") shift *= 0.75;
    else if (st7EmotionMode === "angry") shift *= 1.15;
    else if (st7EmotionMode === "surprised") shift *= 0.85;
    else if (st7EmotionMode === "fearful") shift *= 0.95;
    else if (st7EmotionMode === "sad") shift *= 0.7;
    else if (st7EmotionMode === "disgusted") shift *= 1.3;

    for (let x = 0; x < segW; x++) {
      let sx = clampInt(x0 + x + shift, 0, W - 1);
      let dx = x0 + x;

      let src = 4 * (sx + y * W);
      let dst = 4 * (dx + y * W);

      let addR = 28 * k;
      let addG = 8 * k;
      let addB = 5 * k;

      if (st7EmotionMode === "happy") {
        addB += 6 * k;
      } else if (st7EmotionMode === "angry") {
        addR += 16 * k;
        addG *= 0.7;
        addB *= 0.6;
      } else if (st7EmotionMode === "surprised") {
        addR += 8 * k;
        addG += 6 * k;
      } else if (st7EmotionMode === "fearful") {
        addB += 10 * k;
      } else if (st7EmotionMode === "sad") {
        addR *= 0.75;
        addG *= 0.7;
        addB *= 0.85;
      } else if (st7EmotionMode === "disgusted") {
        addR *= 0.82;
        addG += 16 * k;
        addB *= 0.75;
      }

      g.pixels[dst + 0] = clamp255(g.pixels[src + 0] + addR);
      g.pixels[dst + 1] = clamp255(g.pixels[src + 1] + addG);
      g.pixels[dst + 2] = clamp255(g.pixels[src + 2] + addB);
    }
  }
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

async function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(width, height);
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
  applyState5EmotionInstant("neutral");

  initState6Scene();

  makeState7Buffer();
  setState7Emotion("neutral");
  restartState7();

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
      let newVal = distortValue(emotion, e[emotion]);

      distortedCache[emotion] = lerp(
        distortedCache[emotion] || newVal,
        newVal,
        0.2
      );
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
      if (neutralStall) {
        drawNeutralStallScreen();
        return;
      } else {
        drawState1();
      }
      break;
    case 2:
      image(video, 0, 0, width, height);
      if (neutralStall) {
        drawNeutralStallScreen();
        return;
      } else {
        drawState2();
      }
      break;
    case 3:
      image(video, 0, 0, width, height);
      if (neutralStall) {
        drawNeutralStallScreen();
        return;
      } else {
        drawState3();
      }
      break;
    case 4:
      image(video, 0, 0, width, height);
      if (neutralStall) {
        drawNeutralStallScreen();
        return;
      } else {
        drawState4();
      }
      break;
    case 5:
      image(video, 0, 0, width, height);
      if (neutralStall) {
        drawNeutralStallScreen();
        return;
      } else {
        drawState5();
      }
      break;
    case 6:
      image(video, 0, 0, width, height);
      if (neutralStall) {
        drawNeutralStallScreen();
        return;
      } else {
        drawState6();
      }
      break;
    case 7:
      image(video, 0, 0, width, height);
      if (neutralStall) {
        drawNeutralStallScreen();
        return;
      } else {
        drawState7();
      }
      break;
    case 8:
      image(video, 0, 0, width, height);
      if (neutralStall) {
        drawNeutralStallScreen();
        return;
      } else {
        drawState8();
      }
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

    if (sum > 0) {
      for (let emotion in distorted) {
        distorted[emotion] /= sum;
      }
    }

    // determine dominant distorted emotion
    let emotionName = Object.keys(distorted).reduce((a, b) =>
      distorted[a] > distorted[b] ? a : b
    );

    initDetectedEmotion = emotionName;
    obsDetectedEmotion = emotionName;
    misDetectedEmotion = emotionName;

    if (state === 5) {
      setState5Emotion(emotionName);
    }

    if (state === 6) {
      setState6Emotion(emotionName);
    }

    if (state === 7) {
      if (st7EmotionMode !== emotionName) {
        setState7Emotion(emotionName);
        restartState7();
      }
    }

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
      if (happyStart) emotionPoints.happy += 1 / 120; // 1pt per 2sec
      if (angryStart) emotionPoints.angry += 1 / 60; // 1pt per 1sec
      if (surprisedStart) emotionPoints.surprised += 1 / 120; // 1pt per 2sec
      if (neutralStart) emotionPoints.neutral += 1 / 420; // 1pt per 7sec
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
    /* HIDING TIMER
    // shows timer if audio playing
    if (audioPlaying) {
      let elapsed = (now - audioStartTime) / 1000;
      let remaining = (audioTotalDuration / 1000 - elapsed).toFixed(1);
      fill(255);
      textAlign(CENTER, TOP);
      textSize(20);
      text("Time remaining: " + remaining + "s", width / 2, 10);
    }
    */
  }
  // Display detected emotion at bottom center
  if (lastDetectedEmotion === "neutral") {
    text("SHOW MORE EMOTION", width / 2, height - 20);
  } else {
    text("Emotion Detected: " + lastDetectedEmotion, width / 2, height - 20);
  }
  /*
  // displays current state in top right
  fill(255);
  textAlign(RIGHT, TOP);
  textSize(24);
  text("State: " + state, width - 20, 20);
  */
}

//---------------------------------------------------------------------------------------------------

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

  //creates random value with no flicker
  let randomValue = noise(frameCount * 0.02 + emotion.length * 10);

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
    let extraDelay = random(500, 1000); //delay time after audio in ms
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
  //some have a random chance between two jumps
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
      happy: 1,
      neutral: 0,
      angry: random() < 0.5 ? 2 : 1,
      surprised: 1,
      fearful: random() < 0.5 ? 2 : 1,
      sad: random() < 0.5 ? 2 : 1,
      disgusted: random() < 0.5 ? 2 : 1,
    },
    3: {
      happy: 1,
      neutral: random() < 0.75 ? 1 : 0,
      angry: random() < 0.5 ? 2 : 1,
      surprised: 1,
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
    neutralStall = true;
    restartNeutralStallSystem();
    audioPlaying = true;
  } else {
    neutralStall = false;
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

  //stores points
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

    // speed increases with state number
    let speed = state < 3 ? 0 : map(state, 3, 9, 0.02, 0.15);
    let boxPulseAlpha = state < 3 ? 255 : 128 + sin(frameCount * speed) * 127;

    noFill();
    push();
    colorMode(RGB, 255);
    let col = red(color);
    stroke(red(color), green(color), blue(color), boxPulseAlpha);
    strokeWeight(3.5);
    rect(
      box.x * scaleX,
      box.y * scaleY,
      box.width * scaleX,
      box.height * scaleY
    );
    pop();
  }
}

function restartNeutralStallSystem() {
  // random neutral audio
  let neutralAudio = new Audio("data/neutral_" + int(random(1, 4)) + ".mp3");

  neutralAudio.addEventListener("loadedmetadata", function () {
    let duration = neutralAudio.duration * 1000;
    neutralAudio.play();

    setTimeout(function () {
      neutralStall = false;
      audioPlaying = false;
      determineTransition();
    }, duration);
  });

  currentPrompt = random(promptMessages);

  dots = 0;
  lastDotChange = millis();

  glitchSlices = [];
  errorGlitchTimer = 0;
  errorGlitchActive = false;

  zapActive = false;
  zapTimer = frameCount + int(random(20, 60));
  zapDuration = 0;
  zapIntensity = 0;
  zapType = 0;
}

function drawNeutralStallScreen() {
  background(9, 11, 16);

  drawGradientLines();
  drawGrid();
  drawGlitchBackground();
  drawFilmGrain();

  let panelW = min(760, width * 0.88);
  let panelH = 300;
  let cx = width / 2;
  let cy = height / 2;

  updateZap();
  drawMainPanel(cx, cy, panelW, panelH);
  drawGlitchSlices(cx, cy, panelW, panelH);
  drawCornerMarks();
  updateDots();
}

function updateZap() {
  if (frameCount > zapTimer) {
    if (zapActive) {
      zapActive = false;
      zapTimer = frameCount + int(random(40, 120));
    } else {
      if (random() < 0.6) {
        zapActive = true;
        zapDuration = int(random(2, 8));
        zapIntensity = random(0.4, 1.0);
        zapType = int(random(4));
        zapTimer = frameCount + zapDuration;
      } else {
        zapTimer = frameCount + int(random(20, 60));
      }
    }
  }
}

function getZapOffset() {
  if (!zapActive) return { tx: 0, ty: 0, skewX: 0, skewY: 0 };

  if (zapType === 0) {
    return {
      tx: random(-6, 6) * zapIntensity,
      ty: random(-3, 3) * zapIntensity,
      skewX: 0,
      skewY: 0,
    };
  }

  if (zapType === 1) {
    return {
      tx: random(-3, 3) * zapIntensity,
      ty: random(-2, 2) * zapIntensity,
      skewX: random(-0.012, 0.012) * zapIntensity,
      skewY: random(-0.006, 0.006) * zapIntensity,
    };
  }

  if (zapType === 2) {
    return {
      tx: random(-8, 8) * zapIntensity,
      ty: random(-4, 4) * zapIntensity,
      skewX: 0,
      skewY: 0,
    };
  }

  return {
    tx: random(-4, 4) * zapIntensity,
    ty: random(-2, 2) * zapIntensity,
    skewX: 0,
    skewY: 0,
  };
}

function drawGradientLines() {
  for (let i = 0; i < height; i += 2) {
    stroke(28, 38, 58, map(i, 0, height, 20, 6));
    line(0, i, width, i);
  }
}

function drawGrid() {
  stroke(26, 30, 40, 55);
  strokeWeight(1);
  for (let x = 0; x < width; x += 42) line(x, 0, x, height);
  for (let y = 0; y < height; y += 42) line(0, y, width, y);
}

function drawGlitchBackground() {
  // moving horizontal interference
  for (let y = 0; y < height; y += 2) {
    stroke(
      170 + random(-30, 30),
      180 + random(-30, 30),
      200 + random(-30, 30),
      random(14, 38)
    );
    let shift = random(-28, 28);
    line(shift, y, width + shift, y);
  }

  // bright glitch bands
  for (let i = 0; i < 8; i++) {
    let gy = random(height);
    let gh = random(3, 22);

    noStroke();
    rectMode(CORNER);

    fill(220, 235, 255, random(15, 46));
    rect(random(-20, 20), gy, width + 40, gh);

    fill(255, 60, 60, random(10, 30));
    rect(random(-12, 12), gy + 1, width + 24, gh * 0.5);

    fill(60, 200, 255, random(8, 26));
    rect(random(-8, 8), gy + gh * 0.3, width + 16, gh * 0.4);

    rectMode(CENTER);
  }

  // rolling scanline band
  let bandY = ((frameCount * 3.5) % (height + 120)) - 60;
  for (let i = -30; i < 30; i++) {
    let yy = bandY + i * 1.8;
    if (yy > 0 && yy < height) {
      stroke(210, 225, 255, map(abs(i), 0, 30, 46, 0));
      line(0, yy, width, yy);
    }
  }

  // blocky digital chunks
  noStroke();
  for (let i = 0; i < 90; i++) {
    let bx = random(width);
    let by = random(height);
    let bw = random(15, 120);
    let bh = random(2, 14);

    rectMode(CORNER);

    fill(210, 225, 255, random(13, 51));
    rect(bx, by, bw, bh);

    if (random() < 0.45) {
      fill(255, 60, 60, random(10, 41));
      rect(bx + random(-8, 8), by + random(-2, 2), bw * random(0.5, 1.2), bh);
    }

    if (random() < 0.2) {
      fill(60, 200, 255, random(10, 31));
      rect(bx + random(-4, 4), by, bw * random(0.6, 1.0), bh * 0.7);
    }

    rectMode(CENTER);
  }

  // vertical tear streaks
  for (let i = 0; i < 5; i++) {
    let vx = random(width);
    let vy = random(height * 0.7);
    let vl = random(20, 80);

    stroke(255, 255, 255, random(15, 46));
    strokeWeight(random(1, 3));
    line(vx, vy, vx + random(-3, 3), vy + vl);
  }
}

function drawFilmGrain() {
  noStroke();
  rectMode(CORNER);

  for (let i = 0; i < 5000; i++) {
    fill(random(100, 230), random(100, 230), random(100, 230), random(8, 32));
    rect(random(width), random(height), 1, 1);
  }

  for (let i = 0; i < 1200; i++) {
    fill(0, random(12, 30));
    rect(random(width), random(height), 1, 1);
  }

  rectMode(CENTER);
}

function drawMainPanel(cx, cy, panelW, panelH) {
  let zap = getZapOffset();

  push();
  translate(zap.tx, zap.ty);

  if (zap.skewX !== 0 || zap.skewY !== 0) {
    applyMatrix(1, zap.skewY, zap.skewX, 1, 0, 0);
  }

  let left = cx - panelW / 2;
  let top = cy - panelH / 2;
  let right = cx + panelW / 2;
  let bottom = cy + panelH / 2;

  // panel body
  noStroke();
  fill(14, 18, 26, 240);
  rect(cx, cy, panelW, panelH, 14);

  // panel grain
  noStroke();
  rectMode(CORNER);
  for (let i = 0; i < 500; i++) {
    fill(random(120, 200), random(120, 200), random(120, 200), random(8, 26));
    rect(random(left + 6, right - 6), random(top + 6, bottom - 6), 1, 1);
  }
  rectMode(CENTER);

  // border
  stroke(120, 135, 165, 140);
  strokeWeight(1.5);
  noFill();
  rect(cx, cy, panelW, panelH, 14);

  // scanline inside panel
  let scanY = map(sin(frameCount * 0.02), -1, 1, top + 28, bottom - 28);
  stroke(190, 215, 255, 140);
  strokeWeight(2);
  line(left + 22, scanY, right - 22, scanY);

  // flicker blocks
  noStroke();
  rectMode(CORNER);
  for (let i = 0; i < 12; i++) {
    fill(180, 205, 255, random(10, 36));
    rect(
      random(left + 25, right - 100),
      random(top + 25, bottom - 25),
      random(20, 100),
      random(3, 12),
      2
    );
  }
  rectMode(CENTER);

  drawZapFX(cx, cy, panelW, panelH);

  // error symbol
  fill(225, 232, 248);
  textAlign(CENTER, CENTER);
  textSize(28);
  text("[ ! ]", cx, cy - 88);

  // title
  textSize(22);
  fill(238, 242, 252);
  text("NO EMOTION DETECTED", cx, cy - 44);

  // subtitle with animated dots
  textSize(14);
  fill(158, 170, 192);
  text(currentPrompt + ".".repeat(dots), cx, cy + 4);

  // info lines
  textSize(12);
  fill(118, 130, 152);
  text("STATUS: WAITING FOR FACIAL INPUT", cx, cy + 52);
  text("SIGNAL CONFIDENCE: insufficient", cx, cy + 72);

  // bottom message
  fill(138, 148, 168);
  textSize(11);
  text("AWAITING EMOTIONAL CONFIRMATION", cx, cy + 116);

  drawGlitchErrorTab(right - 188, top + 10, 168, 32);

  pop();
}

function drawZapFX(cx, cy, panelW, panelH) {
  if (!zapActive) return;

  let left = cx - panelW / 2;
  let top = cy - panelH / 2;

  // rgb halo split
  noStroke();
  fill(255, 60, 60, random(15, 46) * zapIntensity);
  rect(cx + random(-6, -2), cy + random(-2, 2), panelW, panelH, 14);

  fill(60, 200, 255, random(15, 46) * zapIntensity);
  rect(cx + random(2, 6), cy + random(-2, 2), panelW, panelH, 14);

  // border flash
  stroke(255, 255, 255, random(76, 178) * zapIntensity);
  strokeWeight(random(1.5, 3));
  noFill();
  rect(cx, cy, panelW, panelH, 14);

  // horizontal slice tears
  let sliceCount = int(random(1, 5));
  noStroke();
  rectMode(CORNER);

  for (let i = 0; i < sliceCount; i++) {
    let sy = top + random(10, panelH - 10);
    let sh = random(3, 14);
    let sw = panelW * random(0.3, 1.0);
    let sx = left + random(0, panelW - sw);
    let shiftX = random(-18, 18) * zapIntensity;

    fill(220, 235, 255, random(38, 115) * zapIntensity);
    rect(sx + shiftX, sy, sw, sh);

    fill(255, 70, 70, random(26, 77) * zapIntensity);
    rect(sx + shiftX * 0.6, sy + 1, sw * random(0.6, 1.0), sh * 0.5);
  }

  rectMode(CENTER);

  // pixel scatter on panel edges
  if (zapIntensity > 0.6) {
    noStroke();
    rectMode(CORNER);

    for (let i = 0; i < 12; i++) {
      let px, py;

      if (random() < 0.5) {
        px = left + random(-4, panelW + 4);
        py = top + (random() < 0.5 ? random(-4, 0) : panelH + random(0, 4));
      } else {
        px =
          random() < 0.5 ? left + random(-4, 0) : left + panelW + random(0, 4);
        py = top + random(-4, panelH + 4);
      }

      fill(
        random(200, 255),
        random(60, 200),
        random(60, 200),
        random(128, 230)
      );
      rect(px, py, random(1, 5), random(1, 4));
    }

    rectMode(CENTER);
  }
}

function drawGlitchErrorTab(x, y, w, h) {
  if (frameCount > errorGlitchTimer) {
    errorGlitchActive = random() < 0.07;
    errorGlitchTimer =
      frameCount + (errorGlitchActive ? int(random(3, 9)) : int(random(8, 22)));
  }

  let label = "ERROR";
  let altLabels = [
    "ERR0R / NEUTRAL",
    "ERROR / N3UTRAL",
    "ERROR / SIGNAL",
    "ERR\u200BOR / ???",
    "E\u200BR\u200BRROR",
  ];

  if (errorGlitchActive && random() < 0.45) {
    label = random(altLabels);
  }

  rectMode(CORNER);

  noStroke();
  fill(255, 60, 60, errorGlitchActive ? random(64, 140) : random(26, 56));
  rect(
    x + (errorGlitchActive ? random(-10, -3) : random(-4, -1)),
    y + random(-2, 2),
    w,
    h,
    5
  );

  fill(60, 200, 255, errorGlitchActive ? random(51, 128) : random(20, 46));
  rect(x + random(3, 10), y + random(-2, 2), w, h, 5);

  if (errorGlitchActive) {
    fill(80, 255, 140, random(26, 71));
    rect(x + random(-7, 7), y + random(-3, 3), w, h, 5);
  }

  let stripCount = errorGlitchActive ? int(random(4, 10)) : int(random(1, 4));
  for (let i = 0; i < stripCount; i++) {
    let sy = y + random(1, h - 3);
    let sh2 = random(2, errorGlitchActive ? 8 : 4);
    let sw = w * random(0.4, 1.3);
    let sx =
      x + random(errorGlitchActive ? -10 : -3, errorGlitchActive ? 10 : 3);

    fill(255, 255, 255, random(51, errorGlitchActive ? 166 : 77));
    rect(sx, sy, sw, sh2);

    fill(255, 60, 60, random(38, errorGlitchActive ? 128 : 64));
    rect(sx + random(-3, 3), sy + 1, sw * random(0.7, 1.1), sh2 * 0.6);

    if (errorGlitchActive && random() < 0.5) {
      fill(60, 200, 255, random(26, 102));
      rect(sx + random(-4, 4), sy, sw * random(0.5, 0.9), sh2 * 0.8);
    }
  }

  if (errorGlitchActive) {
    for (let i = 0; i < 18; i++) {
      let px = x + random(-12, w + 12);
      let py = y + random(-6, h + 6);
      let col = int(random(3));

      if (col === 0) {
        fill(255, 60, 60, random(77, 204));
      } else if (col === 1) {
        fill(60, 200, 255, random(77, 204));
      } else {
        fill(255, 255, 100, random(77, 204));
      }

      rect(px, py, random(1, 4), random(1, 3));
    }
  }

  // clean readable base tab
  stroke(175, 195, 228, 178);
  strokeWeight(1.3);
  fill(errorGlitchActive ? color(50, 30, 38, 224) : color(40, 46, 60, 237));
  rect(x, y, w, h, 5);

  // tab grain
  noStroke();
  for (let i = 0; i < 200; i++) {
    fill(
      errorGlitchActive
        ? color(255, 180, 180, random(10, 41))
        : color(220, 235, 255, random(10, 41))
    );
    rect(random(x + 2, x + w - 2), random(y + 2, y + h - 2), 1, 1);
  }

  // scan strip
  fill(255, 255, 255, 38);
  rect(x + 3, y + 3 + ((frameCount * 0.9) % (h - 6)), w - 6, 2);

  // text
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(10);

  if (errorGlitchActive) {
    fill(255, 80, 80, 178);
    text(label, x + w / 2 + 3, y + h / 2 + 4);

    fill(60, 200, 255, 153);
    text(label, x + w / 2 - 2, y + h / 2 + 4);
  }

  fill(errorGlitchActive ? color(255, 240, 240) : color(235, 242, 252));
  text(label, x + w / 2, y + h / 2 + 4);

  // pulsing red dot
  let pulse = (sin(frameCount * 0.12) + 1) / 2;
  noStroke();
  fill(
    255,
    errorGlitchActive ? int(random(40, 90)) : 85,
    85,
    int(178 + pulse * 77)
  );
  ellipse(x + 9, y + h / 2, 7, 7);
}

function drawGlitchSlices(cx, cy, panelW, panelH) {
  let left = cx - panelW / 2;
  let top = cy - panelH / 2;

  if (random() < 0.12) {
    glitchSlices.push({
      x: left + random(20, panelW - 120),
      y: top + random(20, panelH - 20),
      w: random(40, 200),
      h: random(2, 12),
      dx: random(-30, 30),
      life: int(random(2, 7)),
      isRed: random() < 0.4,
    });
  }

  rectMode(CORNER);

  for (let i = glitchSlices.length - 1; i >= 0; i--) {
    let g = glitchSlices[i];

    noStroke();

    if (g.isRed) {
      fill(255, 80, 80, 31);
    } else {
      fill(220, 235, 255, 31);
    }

    rect(g.x + g.dx, g.y, g.w, g.h);

    fill(60, 200, 255, 18);
    rect(g.x + g.dx * 0.5, g.y + 1, g.w, g.h);

    g.life--;

    if (g.life <= 0) {
      glitchSlices.splice(i, 1);
    }
  }

  rectMode(CENTER);
}

function drawCornerMarks() {
  stroke(110, 135, 175, 140);
  strokeWeight(2);

  let m = 22;
  let len = 20;

  line(m, m, m + len, m);
  line(m, m, m, m + len);

  line(width - m, m, width - m - len, m);
  line(width - m, m, width - m, m + len);

  line(m, height - m, m + len, height - m);
  line(m, height - m, m, height - m - len);

  line(width - m, height - m, width - m - len, height - m);
  line(width - m, height - m, width - m, height - m - len);
}

function updateDots() {
  if (millis() - lastDotChange > 500) {
    dots = (dots + 1) % 4;
    lastDotChange = millis();
  }
}

//recalibrates canvas based on screen size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(width, height);

  obsCols = ceil(width / obsRez);
  obsRows = ceil(height / obsRez);
  obsField = [];

  for (let i = 0; i < obsCols * obsRows; i++) {
    obsField[i] = random(TWO_PI);
  }

  st5NoiseLayer = createGraphics(width, height);
  st5SceneLayer = createGraphics(width, height);

  makeState5NoiseLayer();

  initState6Scene();
  makeState7Buffer();

  pixelDensity(1);
}
