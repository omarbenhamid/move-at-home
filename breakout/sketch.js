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
  select('#status').html('Model Loaded');
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


// From https://editor.p5js.org/bansal321/sketches/HJAFXebeV

// IN ORDER TO PLAY - CLICK THE ON THE SCREEN
// MOVE THE PADDLE WITH THE ARROW KEYS
// SHOOT USING SPACEBAR

let moveMent = 280
let rightPress = false
let leftPress = false
let game = true
let dx = -6
let dy = -6
let score = 0
let lives = 3
let livesRestart = false
const bricks = []
const brickColors = ["#CCAAFF", "#CCBBFF", "#CCCCFF", "#CCDDFF", "#CCEEFF", "#CCFFFF", "#CCFFEE", "#CCFFDD"];

const circle = {
  x: moveMent + 50,
  y: 380,
  radius: 20
}

function setup() {
  createCanvas(600, 400);
  createBricks()
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
}

function paddle() {
  stroke('purple')
  fill('#FF6961')
  if(poses[0])
    moveMent = 500 - (poses[0].pose.leftShoulder.x + poses[0].pose.rightShoulder.x)/2;
  rect(moveMent, 385, 100, 15, 20)
  if(moveMent > 500) moveMent=500;
  if(moveMent < 0) moveMent=0;
}

function ball() {
  noStroke()
  fill('#FBD8F8')
  ellipse(circle.x, circle.y, circle.radius, circle.radius)
  if(!poses[0]) return; //Do not move if no pose is detected
  if (circle.y <= 0) {
    dy = -dy
    score++
  }
  if (circle.y >= height - 15 && circle.x > moveMent && circle.x <= moveMent + 50) {
    dy = -dy
    if (dx > 0) dx = -dx
    if (dx < 0) dx = dx
  }
  if (circle.y >= height - 15 && circle.x > moveMent + 50 && circle.x <= moveMent + 100) {
    dy = -dy
    if (dx > 0) dx = dx
    if (dx < 0) dx = -dx
  }
  if (circle.x >= width - 10 || circle.x <= 0) dx = -dx

  bricks.forEach((item, index) => {
  	if(checkCollisionBottom(circle, item)){
      dy = -dy
    	score++
      bricks.splice(index, 1)
    }
  })

  if (circle.y > height) {
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
  const brickWidth = width / cols
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
    rect(brick.x, brick.y, brick.w, brick.h)
  })
}

function keyPressed(value) {
  if (value.key === 'ArrowRight') {
    rightPress = true
  }
  if (value.key === 'ArrowLeft') {
    leftPress = true
  }
  if (value.keyCode === 32 && livesRestart) {
    livesRestart = false
    circle.x = moveMent + 50
    circle.y = 380
  }
  if (value.keyCode === 32 && !game) {
    game = true
    circle.x = moveMent + 50
    circle.y = 380
    score = 0
    lives = 3
    dy = -6
    moveMent = 250
    createBricks()
  }
}

function keyReleased(value) {
  if (value.key === 'ArrowRight') {
    rightPress = false
  }
  if (value.key === 'ArrowLeft') {
    leftPress = false
  }
}

function restartGame() {
  fill('#FFEEEE')
  textAlign(CENTER);
  noStroke()
  textStyle(BOLD);
  textFont('Arial');
  textSize(38)
  text('GAME OVER', 300, 170)
  textFont('Arial');
  textSize(28);
  text('Final score: ' + score, 300, 200);
  textSize(18);
  text('Press SpaceBar to restart game', 300, 225);
}

function lostLifeText() {
  fill('#FFEEEE')
  textAlign(CENTER);
  noStroke()
  textStyle(BOLD);
  textFont('Arial');
  textSize(36)
  text('Life Lost', 300, 170)
  textFont('Arial');
  textSize(24);
  text('You now have ' + lives + ' lives remaining', 300, 200);
  textSize(18);
  text('Press SpaceBar to restart', 300, 225);
}

function scoreText() {
  fill('#FFEEEE')
  textStyle(BOLD);
  textAlign(CENTER);
  noStroke()
  textFont('Arial');
  textSize(18);
  text('Score: ' + score, 555, 20);
}

function livesText() {
  textStyle(BOLD);
  textAlign(CENTER);
  noStroke()
  textFont('Arial');
  textSize(18);
  text('Lives: ' + lives, 40, 20);
}

function checkCollisionBottom(ball, brick) {
	if (ball.y - 20 < brick.y && ball.x > brick.x && ball.x <= brick.x + 58) {
  	return true
  }
}

function draw() {
  /*
  image(video, 0, 0, width, height);
  */
  // We can call both functions to draw all keypoints and the skeletons

  background('#779ecb');

  //drawKeypoints();
  //drawSkeleton();

  if (game && !livesRestart) ball()
  if (livesRestart && game) lostLifeText()
  if (!game && livesRestart) restartGame()
  if (game) {
    scoreText()
    livesText()
    drawBricks()
    paddle()
  }

}
