// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];

// Breakout From https://editor.p5js.org/bansal321/sketches/HJAFXebeV

// IN ORDER TO PLAY - CLICK THE ON THE SCREEN
// MOVE THE PADDLE WITH THE ARROW KEYS
// SHOOT USING SPACEBAR

let moveMent = 280
let game = true
let dx = -6
let dy = -6
let score = 0
let lives = 3
let livesRestart = true

let bounceSound;
let brickSound;

let triggerAction;

const bricks = []
const brickColors = ["#CCAAFF", "#CCBBFF", "#CCCCFF", "#CCDDFF", "#CCEEFF", "#CCFFFF", "#CCFFEE", "#CCFFDD"];

const circle = {
  x: moveMent + 50,
  y: 380,
  radius: 20
}

/*
function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}*/

function modelReady() {
  //select('#status').html('Model Loaded');
}
/*
function draw() {
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}
*/

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function preload() {
    bounceSound = loadSound('bounce.mp3');
    brickSound = loadSound('brick breaking.mp3');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function sx(x) {
  return width * x/600;
}

function sy(y) {
  return height * y / 400;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  createBricks();
  video = createCapture(VIDEO);
  video.size(600, 400);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
    if(poses[0]) {
        interpretPose(poses[0].pose)
    }
  });
  // Hide the video element, and just show the canvas
  video.hide();

}

let MIN_CONFIDENCE=0.5;
function interpretPose(pose) {
  let wry,shy,shw;
  if(pose.leftWrist.confidence > MIN_CONFIDENCE) {
    wry = pose.leftWrist.y;
  }else if(pose.rightWrist.confidence > MIN_CONFIDENCE) {
    wry = pose.rightWrist.y;
  }else return;

  shw = Math.abs(pose.leftShoulder.x - pose.rightShoulder.x);
  shy = (pose.leftShoulder.y + pose.rightShoulder.y) / 2;

  if((shy - wry) > (shw /2)) triggerAction = true;
}

function paddle() {
  stroke('purple')
  fill('#FF6961')
  if(poses[0])
    moveMent = 500 - (poses[0].pose.leftShoulder.x + poses[0].pose.rightShoulder.x)/2;
  rect(sx(moveMent), sy(385), sx(100), sy(15), 20)
  if(moveMent > 500) moveMent=500;
  if(moveMent < 0) moveMent=0;
}

function ball() {
  noStroke()
  fill('#FBD8F8')
  ellipse(sx(circle.x), sy(circle.y), sx(circle.radius), sy(circle.radius))
  if(!poses[0]) return; //Do not move if no pose is detected
  if (circle.y <= 0) {
    bounceSound.play();
    dy = -dy
    score++
  }
  if (circle.y >= 400 - 15 && circle.x > moveMent && circle.x <= moveMent + 50) {
    bounceSound.play();
    dy = -dy
    if (dx > 0) dx = -dx
    if (dx < 0) dx = dx
  }
  if (circle.y >= 400 - 15 && circle.x > moveMent + 50 && circle.x <= moveMent + 100) {
    bounceSound.play();
    dy = -dy
    if (dx > 0) dx = dx
    if (dx < 0) dx = -dx
  }
  if (circle.x >= 600 - 10 || circle.x <= 0) {
    bounceSound.play();
    dx = -dx
  }

  bricks.forEach((item, index) => {
  	if(checkCollisionBottom(circle, item)){
      dy = -dy
    	score++
      bricks.splice(index, 1)

      brickSound.play()
    }
  })

  if (circle.y > 400) {
    lives--
    livesRestart = true
    if (lives === 0) game = false
  }
  circle.x += dx
  circle.y += dy
}

function createBricks() {
  const rows = 8
  const cols = 10
  const brickWidth = 600 / cols
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let brick = {
        x: i * 58 + 10,
        y: j * 12 + 30,
        w: 57,
        h: 10,
        color: brickColors[j]
      }
      bricks.push(brick)
    }
  }
}

function drawBricks() {
  bricks.forEach(brick => {
    fill(brick.color)
    rect(sx(brick.x), sy(brick.y), sx(brick.w), sy(brick.h),5);
  })
}

function keyPressed(value) {
  if(value.keyCode === 32) triggerAction = true;
}

function restartGame() {
  fill('#FFEEEE')
  textAlign(CENTER);
  noStroke()
  textStyle(BOLD);
  textFont('Arial');
  textSize(38)
  text('GAME OVER', sx(300), sy(170))
  textFont('Arial');
  textSize(28);
  text('Final score: ' + score, sx(300), sy(200));
  textSize(18);
  text('Press SpaceBar or hold your hands up to restart game', sx(300), sy(225));
}

function lostLifeText() {
  fill('#FFEEEE')
  textAlign(CENTER);
  noStroke()
  textStyle(BOLD);
  //textFont('Arial');
  //textSize(36)
  //text('Life Lost', sx(300), sy(170))
  textFont('Arial');
  textSize(24);
  text('You now have ' + lives + ' lives remaining', sx(300), sy(200));
  textSize(18);
  text('Press SpaceBar or hold your hands up to start', sx(300), sy(225));
}


function notDetectedText() {
  fill('#FFEEEE')
  textAlign(CENTER);
  noStroke()
  textStyle(BOLD);
  textFont('Arial');
  textSize(36)
  text('Detecting ...', sx(300), sy(170))
}

function scoreText() {
  fill('#FFEEEE')
  textStyle(BOLD);
  textAlign(CENTER);
  noStroke()
  textFont('Arial');
  textSize(18);
  text('Score: ' + score, sx(555), sy(20));
}

function livesText() {
  textStyle(BOLD);
  textAlign(CENTER);
  noStroke()
  textFont('Arial');
  textSize(18);
  text('Lives: ' + lives, sx(40), sy(20));
}

function checkCollisionBottom(ball, brick) {
	if (ball.y - 20 < brick.y && ball.x > brick.x && ball.x <= brick.x + 58) {
  	return true
  }
}

function draw() {
  if (triggerAction && livesRestart) {
    livesRestart = false
    circle.x = moveMent + 50
    circle.y = 380
  }
  if (triggerAction && !game) {
    game = true
    circle.x = moveMent + 50
    circle.y = 380
    score = 0
    lives = 3
    dy = -6
    moveMent = 250
    createBricks()
  }
  triggerAction = false;

  if(game && !livesRestart && poses[0]) {
    background('#000000');
  }else{
    push();
    translate(width,0);
    scale(-width/600,height/400);
    image(video, 0, 0, 600, 400);
    drawKeypoints();
    drawSkeleton();
    pop();
  }
  if (game && !livesRestart) ball()
  if(!poses[0]) {
    notDetectedText();
  } else {
    if (livesRestart && game) lostLifeText()
    if (!game && livesRestart) restartGame()
  }

  if (game) {
    scoreText()
    livesText()
    drawBricks()
  }
  paddle()
}
