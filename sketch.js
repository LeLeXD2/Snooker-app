//Lester Lim Kai Bin
//SIM ID: 10261499

//Commentary
//This app is a pool game where users can play snooker and earn power-ups. Users can practice shooting before selecting a gamemode to start a game. There are 3 game modes to choose from: 1 is the normal ball placements, 2 is the randomly placed ball placements, and 3 is the normal placements for colored balls, and all the red balls are randomly placed. I used the in-built random function as the algorithm to randomize the ball placement because it is optimized for general-purpose randomness. It is fast and does not introduce significant computational overhead. In order to put down the cue ball, users have to click inside the D-zone. I chose mouse interaction because it allows the user to have a clear indication of where they are placing the cue ball. This will ensure users can interact with the game easily and naturally. After that, they can control the force of the cue stick with their mouse and shoot it when they press the spacebar. I used this set of mouse/key interactions because it feels intuitive and natural. The use of the mouse to control the force of the cue stick feels natural, as it allows precise control, and users can visually see how far the cue stick is being drawn back. I used the spacebar to shoot, as it is a common and simple interaction for most games. It is large and easy to use, making it an accessible choice for users. If the cue ball goes inside a pocket, it will return to the user. They will receive a warning and can place the cue ball in the D-zone to continue. An error will pop up if the user pockets two colored balls consecutively. For the extension, I have created a power-up system to enhance the user's ability, such as aim assist. With this additional feature, it will entice users to play the game, as there is only one way to obtain more power-ups, which is through pocketing colored balls. Each colored ball gives a different type and number of power-ups based on the snooker point colored ball point system. Users can press X to toggle the reach power-up and press Z to toggle the aim assist power-up. The 2 power-ups can be used simultaneously or separately. Users will be given 2 of each power-up at the start of the game. I used key interaction to toggle on and off the power-up because it is fast and responsive. It keeps the user's focus on the gameplay rather than focusing on moving the mouse to toggle it on. I added sound effects when the balls collide with the use of howler.

//matter.js physics engine
let engine;

//text message for collision with cue ball
let showText = false;
let textMessage = "";

//tracks the previous pocketed ball
let previousBallName;

//textures
let tableTexture;
let ballTextures = [];

//ballls
let cueBall;
let yellowBall;
let blueBall;
let blackBall;
let brownBall;
let pinkBall;
let greenBall;
let redBall;
let balls = [];
const ballRadius = 9.5;

//to ensure the balls dont generate at the very edge of the table
const edgeMargin = ballRadius * 7.5; 

//cuestick
let cuestick;
const cuestickMaxDist = 150;
let isSpacePressed = false;

//enable debug mode 'd' to toggle
let debugMode = false;

//D-zone for placement of cue ball
const semiX = 404; //center X of D-zone
const semiY = 439; //center Y of D-zone
const semiRadius = 80; //radius of D-zone

//balls axis
const semicircleStartX = 405;
const yellowBallStartY = 517;
const greenBallStartY = 357;
const blueBallStartX = 730;
const pinkBallStartX = 997;
const blackBallStartX = 1200;

//Aim Assist power up
let toggleAimAssist = false;
let powerUp = 2;
let toggleReach;
let reachPowerup = 2;

// Table / pockets
const pocketToBallRatio = 3.5;
const rimW = 41; // table rim width

class Boundry {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    // Matter.js uses x and y of center point (not top left)!
    let cx = x + w / 2;
    let cy = y + h / 2;
    this.body = Matter.Bodies.rectangle(cx, cy, w, h, {
      label: "cushion",
      isStatic: true,
    });
    Matter.World.add(engine.world, this.body);
  }
}

//this creates a table with the cushion as well as the pockets
const table = {
  left: 187 - rimW,
  top: 181 - rimW,
  right: 1275,
  bot: 685,
  boundaries: [],
  pockets: [],
  w: function () {
    return this.right - this.left;
  },
  h: function () {
    return this.bot - this.top;
  },
  centerY: function () {
    return this.top + (this.h() / 2) + 26;
  },

  //creating rectangles for the boarder of the table and adding matter.world to it
  initBoundaries: function () {
    this.boundaries = [
      new Boundry(this.left, this.top, this.w(), rimW),
      new Boundry(this.left, this.bot, this.w(), rimW),
      new Boundry(this.left, this.top, rimW, this.h()),
      new Boundry(this.right, this.top, rimW, this.h() + rimW),
    ];
  },
  //creating vector for the 6 pockets on the snooker table 
  initPockets: function () {
    this.pockets = [
      createVector(182, 172), //top left
      createVector(730, 170), //top middle
      createVector(1280, 172), //top right
      createVector(180, 688), //bottom left
      createVector(730, 697), //bottom middle
      createVector(1285, 688), //bottom right
    ];
  },
  //this function checks if the balls in the array gets pocketed. If the color balls get pocketed, it will run through the resetBall() and reset the location. But if it is a red or cue ball that is pocketed, it gets removed from the array
  checkPockets: function () {
    for (let i = balls.length - 1; i >= 0; i--) {
      let ball = balls[i];
      for (let pocket of table.pockets) {
        let d = dist(ball.body.position.x, ball.body.position.y, pocket.x, pocket.y);
        if (d < ballRadius * pocketToBallRatio) {
          
          if (ball.name === "yellow") {
            powerUp++;
            resetBall("yellow");
          } else if (ball.name == "blue") {
            reachPowerup += 2;
            resetBall("blue");
          } else if (ball.name == "black") {
            powerUp += 2;
            reachPowerup += 2;
            resetBall("black");
          } else if (ball.name == "brown") {
            reachPowerup++;
            resetBall("brown");
          } else if (ball.name == "pink") {
            powerUp ++;
            reachPowerup ++;
            resetBall("pink");
          } else if (ball.name == "green") {
            powerUp+= 2;
            resetBall("green");
          } else if (ball.name == "cue") {
            cueBall = null;
            Matter.World.remove(engine.world, ball.body);
            balls.splice(i, 1); // Remove the ball.
            alert("You have potted the white ball! place the ball in the D-zone to continue.")
            console.log("cue ball pocketed");
            cuestick = null;
            powerUp = 0;
            reachPowerup = 0;
          }
          else {
            Matter.World.remove(engine.world, ball.body);
            balls.splice(i, 1); // Remove the ball.
          }

          //error prompt if two colored balls are inserted into the pocket
          if (previousBallName != "cue" && ball.name != "cue" && previousBallName != "red" && ball.name != "red" && previousBallName != null){
            reachPowerup = 0;
            powerUp = 0;
            previousBallName = null;
            alert("Warning! You have potted two coloured balls consecutively");
          } 

          previousBallName = ball.name;
        }
      }
    }
  },
};

//preloading the images/font
function preload() {
  tableTexture = loadImage("images/table.png");
  ballTextures.cue = loadImage("images/cue.png");
  ballTextures.yellow = loadImage("images/yellow.png");
  ballTextures.red = loadImage("images/red.png");
  ballTextures.pink = loadImage("images/pink.png");
  ballTextures.green = loadImage("images/green.png");
  ballTextures.brown = loadImage("images/brown.png");
  ballTextures.blue = loadImage("images/blue.png");
  ballTextures.black = loadImage("images/black.png");
  myFont = loadFont('assets/Roboto-Black.ttf');
}

//creating the balls (set realistic collision using matter.js). The class below adds physics implementation and bouncing when two balls collide or the ball bounces on the cushion
class Ball {
  constructor(x, y, name) {
    this.name = name;
    this.body = Matter.Bodies.circle(x, y, ballRadius, {
      label: "Ball",
      restitution: 1, //high restitution = elastic collision
      friction: 0.005, //adding friction to the ball
      density: 0.01, 
    });
    this.body.name = name;
    Matter.World.add(engine.world, this.body);
    this.rotationAxis = createVector(0, 0, 1);
    this.rotationAngle = 0;
  }

  x() {
    return this.body.position.x;
  }

  y() {
    return this.body.position.y;
  }

  setPosition(x, y) {
    Matter.Body.setPosition(this.body, { x, y });
  }

  setVelocity(x, y) {
    Matter.Body.setVelocity(this.body, { x, y });
  }

  velocity() {
    return new p5.Vector(this.body.velocity.x, this.body.velocity.y);
  }

  display() {
    push();
    translate(this.x(), this.y());
    noStroke();
    //only modify rotation if significant velocity
    if (this.velocity().mag() > 0.1) {
      //rotate perpendicular to velocity
      this.rotationAxis = this.velocity().copy().rotate(HALF_PI);
      //increment angle based on distance traveled
      this.rotationAngle += this.velocity().mag() / (PI * ballRadius);
    }
    rotate(this.rotationAngle, this.rotationAxis);
    texture(ballTextures[this.name]);
    sphere(ballRadius);
    pop();
  }
}

//The next 3 function is the placements of the balls based on the key users pressed. It uses the in-built random() function to randomize the placement of the balls for gamemode 2 and 3
//check if a new ball position overlaps with existing ones
function checkOverlap(newBallX, newBallY) {
  for (let i = 0; i < balls.length; i++) {
    //check if the balls overlaps
    let existingBall = balls[i];
    //this changes the functions to integers
    let x = typeof existingBall.x === "function" ? existingBall.x() : Number(existingBall.x);
    let y = typeof existingBall.y === "function" ? existingBall.y() : Number(existingBall.y);
    
    let d = dist(newBallX, newBallY, x, y);
    if (d < 3 * ballRadius) {
      return true;
    }
  }

  //checks if the ball overlaps the semicircle
  if (isInSemicircle(newBallX, newBallY, semiX, semiY, semiRadius, HALF_PI)){
    return true;
  }

  return false; // No overlap
}

//positioning of the balls for option 1
function rackBallsOption1() {
  //yellowBall
  yellowBall = new Ball(semicircleStartX , yellowBallStartY, "yellow");
  balls.push(yellowBall);

  //brownBall
  brownBall = new Ball(semicircleStartX , table.centerY(), "brown");
  balls.push(brownBall);

  //greenBall
  greenBall = new Ball(semicircleStartX , greenBallStartY, "green");
  balls.push(greenBall);


  //blueBall
  blueBall = new Ball(blueBallStartX , table.centerY(), "blue");
  balls.push(blueBall);

  //pinkBall
  pinkBall = new Ball(pinkBallStartX, table.centerY(), "pink");
  balls.push(pinkBall);

  //blackBall
  blackBall = new Ball(blackBallStartX , table.centerY(), "black");
  balls.push(blackBall);

  //setting the 15 red balls in a triangle
  const footSpotX = 1030;
  const spacing = 2 * ballRadius + 1;
  const xOffset = sqrt(3) * ballRadius; //based on equilateral triangles
  let rowLength = 1;
  let i = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < rowLength; col++) {
      let x = footSpotX + row * xOffset;
      let y = table.centerY() - (rowLength - 1) * ballRadius + col * spacing;
      balls.push(new Ball(x, y, "red"));
      i++;
    }
    rowLength++;
  } 
}

//positioning of the balls for option 2
function rackBallsOption2() {
  //store all the colored balls name in an array
  rackArray = ["yellow", "brown", "green", "blue", "pink", "black"];

  i = 0;
  //randomly generate the x and y and check if it overlaps with existing balls in the array
  for (let count = 0; count < 6;){
    let x = random(table.left + edgeMargin, table.right - edgeMargin);
    let y = random(table.top + edgeMargin, table.bot - edgeMargin);

    if (!checkOverlap(x, y)) {
      //if no overlap, create a new ball and add it to the array
      if (rackArray[i] === "yellow") {
        yellowBall = new Ball (x, y, rackArray[i]);
        balls.push(yellowBall);
      } else if (rackArray[i] == "blue") {
        blueBall = new Ball (x, y, rackArray[i]);
        balls.push(blueBall);
      } else if (rackArray[i] == "black") {
        blackBall = new Ball (x, y, rackArray[i]);
        balls.push(blackBall);
      } else if (rackArray[i] == "brown") {
        brownBall = new Ball (x, y, rackArray[i]);
        balls.push(brownBall);
      } else if (rackArray[i] == "pink") {
        pinkBall = new Ball (x, y, rackArray[i]);
        balls.push(pinkBall);
      } else if (rackArray[i] == "green") {
        greenBall = new Ball (x, y, rackArray[i]);
        balls.push(greenBall);
      }
      count += 1;
      i++;
    }
  }

  //randomly generate the x and y within the boundaries and check if it overlaps with existing balls in the array
  for (let ball = 0; ball <= 15;) {
    //generate random x and y within the boundaries
    let x = random(table.left + edgeMargin, table.right - edgeMargin);
    let y = random(table.top + edgeMargin, table.bot - edgeMargin);

    //check if the new ball position overlaps with any existing ball
    if (!checkOverlap(x, y)) {
      balls.push(new Ball (x, y, "red"));
      ball += 1;
    }
  }
}

//positioning of the balls for option 3
function rackBallsOption3() {
  //yellowBall
  yellowBall = new Ball(semicircleStartX , yellowBallStartY, "yellow");
  balls.push(yellowBall);

  //brownBall
  brownBall = new Ball(semicircleStartX , table.centerY(), "brown");
  balls.push(brownBall);

  //greenBall
  greenBall = new Ball(semicircleStartX , greenBallStartY, "green");
  balls.push(greenBall);


  //blueBall
  blueBall = new Ball(blueBallStartX , table.centerY(), "blue");
  balls.push(blueBall);

  //pinkBall
  pinkBall = new Ball(pinkBallStartX, table.centerY(), "pink");
  balls.push(pinkBall);

  //blackBall
  blackBall = new Ball(blackBallStartX , table.centerY(), "black");
  balls.push(blackBall);

  //randomly generate the x and y within the boundaries and check if it overlaps with existing balls in the array
  for (let ball = 0; ball <= 15;) {
    let x = random(table.left + edgeMargin, table.right - edgeMargin);
    let y = random(table.top + edgeMargin, table.bot - edgeMargin);

    //check if the new ball position overlaps with any existing ball
    if (!checkOverlap(x, y)) {
      balls.push(new Ball (x, y, "red"));
      ball += 1;
    }
  }
}

//remove all the balls from matter world when user change gamemode. This is to prevent duplicate balls from appearing on the table. 
function removeAllBalls() {
  //remove all balls from the physics world (Matter.js)
  for (let i = 0; i < balls.length; i++) {
    Matter.World.remove(engine.world, balls[i].body);
  }

  //clear the balls array
  balls = [];

  //clear other ball references
  cueBall = null;
  yellowBall = null;
  blueBall = null;
  blackBall = null;
  brownBall = null;
  pinkBall = null;
  greenBall = null;
  redBall = null;
}

//D-zone for users to put the cue ball. This is used to debug and check if the Dzone is within the semicircle
function Dzone(debugOption){
  const semiRotationAngle = HALF_PI; //rotation (90 degrees)

  push();
  translate(semiX, semiY);
  rotate(semiRotationAngle);
  noStroke();

  if (debugOption === "yes") {
    fill("yellow");
  } else {
    noFill();
  }
  arc(0, 0, semiRadius * 2, semiRadius * 2, 0, PI);
  pop();
}

//the keyPressed function captures when a key is pressed. When a key is pressed, it loops through each loop, it will run the code if the key matches
function keyPressed() {
  //check if the Space bar is pressed
  if (key === ' ') {  
    isSpacePressed = true;  // Trigger the force
    if (toggleAimAssist && cuestick){
      powerUp--;
    }
    if (toggleReach && cuestick){
      reachPowerup--;
    }
  }
  
  // Check if the "d" key is pressed
  if (key === "d") {
    debugMode = !debugMode;  //toggle the debug mode
  }

  //change the 3 gamemodes based on the input (1, 2, 3)
  if (key === "1"){
    removeAllBalls(); //remove all the balls from the table
    rackBallsOption1(); //arrange based on gamemode
    showText = false;
    cuestick = null;
  }

  if (key === "2"){
    removeAllBalls(); //remove all the balls from the table
    rackBallsOption2(); //arrange based on gamemode
    showText = false;
    previousBallName = null;
    cuestick = null;
  }

  if (key === "3"){
    removeAllBalls(); //remove all the balls from the table
    rackBallsOption3(); //arrange based on gamemode
    showText = false;
    previousBallName = null;
    cuestick = null;
  }

  //toggling aim assist
  if (key === "z"){
    if (powerUp > 0){
      toggleAimAssist = !toggleAimAssist; //toggle the aim assist
    }
  }

  //toggling reach
  if (key === "x"){
    if (reachPowerup > 0){
      toggleReach = !toggleReach; //toggle the reach
    }
  }
}

//draws debug when the debug mode is true. This is used to check for the boundaries of the table and the D-zone to ensure that none of the randomly generated ball is outside those zone
function DrawDebug() {
  if (!debugMode) return;

  //draw felt outline in magenta
  push();
  stroke("cyan");
  strokeWeight(3);
  let c = color("magenta");
  c.setAlpha(100);
  fill(c);
  for (let b of table.boundaries) {
    rect(b.x, b.y, b.w, b.h);
  }
  pop();

  //draw pockets as circles
  push();
  fill("yellow");
  noStroke();
  table.pockets.forEach((pocket) => {
    let r = ballRadius * pocketToBallRatio;
    ellipse(pocket.x, pocket.y, r, r);
  });
  pop();
  
  Dzone("yes");
}

//checks if mouse in semicircle. This is for the user to place the cue ball if the mouse is inside the semicircle
function isInSemicircle(checkX, checkY, cx, cy, radius, rotationAngle) {
  const distFromCenter = dist(checkX, checkY, cx, cy);

  if (distFromCenter > radius + 15) return false;
  let angle = atan2(checkY - cy, checkX - cx); 
  angle -= rotationAngle;
  angle = (angle + TWO_PI) % TWO_PI;

  return angle >= 0 && angle <= PI;
}

//mouseClicked Function to place the cue ball if the isInSemicircle() function returns true and if cue ball exist. This is so the cuestick appears if the mouse is in the D-zone or on the cue ball
function mouseClicked() {
  if (cueBall){
    let nearCueBall = dist(mouseX, mouseY, cueBall.body.position.x, cueBall.body.position.y) <= ballRadius * 2;
    if (nearCueBall) {
      cuestick = createVector(mouseX, mouseY);
      console.log("ball clicked!");
    }
  }else{
    //check if click is inside the semicircle
    if (isInSemicircle(mouseX, mouseY, semiX, semiY, semiRadius, HALF_PI)) {
      //cueBall
      cueBall = new Ball(mouseX, mouseY, "cue");
      balls.push(cueBall);
      cuestick = createVector(mouseX, mouseY);
      console.log("Semicircle clicked!");
    }
  }
}

//draws the cuestick when user click/place the cue ball
function drawCueStick(pivotX, pivotY, ballX, ballY) {
  push();
  translate(pivotX, pivotY);

  //calculate the angle to face the ball
  let angle = atan2(ballY - pivotY, ballX - pivotX);
  rotate(angle);

  //draw the cue stick
  strokeWeight(8);
  stroke(160, 82, 45);
  line(-540, 0, 0, 0);

  strokeWeight(4);
  stroke(200, 200, 200);
  line(-40, 0, 0, 0);
  pop();
}

//apply force when user shoot the cue ball. When users press the spacebar key, it will go through this function and apply the force on the cueball
function applyForce(){
  if (!cuestick) return;
  
  //if space is pressed 
  if (isSpacePressed) {
    let force = p5.Vector.sub(cuestick, createVector(mouseX, mouseY));
    force.mult(0.05); // Adjust force magnitude
    Matter.Body.setVelocity(cueBall.body, force);
    cuestick = null;
    isSpacePressed = false;
  }
}

//reset the colored ball when pocketed. it resets the ball to the original position and set the velocity to 0 so that the colored balls would not move
function resetBall(name){
  if (name === "yellow") {
    yellowBall.setPosition(semicircleStartX, yellowBallStartY);
    yellowBall.setVelocity(0, 0);
  };

  if (name == "blue") {
    blueBall.setPosition(blueBallStartX, table.centerY());
    blueBall.setVelocity(0, 0);
  };

  if (name == "black") {
    blackBall.setPosition(blackBallStartX, table.centerY());
    blackBall.setVelocity(0, 0);
  }
  
  if (name == "brown") {
    brownBall.setPosition(semicircleStartX, table.centerY());
    brownBall.setVelocity(0, 0);
  }
  
  if (name == "pink") {
    pinkBall.setPosition(pinkBallStartX, table.centerY());
    pinkBall.setVelocity(0, 0);
  }
  
  if (name == "green") {
    greenBall.setPosition(semicircleStartX, greenBallStartY);
    greenBall.setVelocity(0, 0);
  }
}

//draw force bar
function drawForceBar(force) {
  let barWidth = 300;
  let barHeight = 30; 
  let barX = 150; 
  let barY = 90; 
  
  //create the background of the bar
  fill(0);
  rect(barX, barY, barWidth, barHeight, 5);
  
  //create the fill bar
  fill(234, 43, 98);
  rect(barX, barY, (barWidth * force) / 100, barHeight, 5);
  
  //display force percentage
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(Math.round(force) + "%", barX + barWidth / 2, barY + barHeight / 2);
}

//draws the error prompt for collision detection.
function drawTextBox(textContent) {
  push();
  //draw the background rectangle for the text box
  fill(234, 43, 98, 200);
  stroke(255);
  strokeWeight(2);
  rect(910, 80, 400, 50, 10);
  
  //add text inside the box
  fill(255);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text(textContent, 910 + 400 / 2, 80 + 50 / 2);
  pop();
}

//function to draw the aim assist power up counter on the top left(extra implementation)
function aaPowerUp(count){
  stroke(255);
  strokeWeight(2);
  noFill();
  
  fill(0);
  ellipse(50, 50, 50, 50);
  ellipse(50, 50, 25, 25);
  
  line(50 - 25, 50, 50 + 25, 50);
  
  line(50, 50 - 25, 50, 50 + 25);
  
  fill(255, 0, 0);
  noStroke();
  ellipse(50, 50, 8, 8);

  push();
  fill(255);
  noStroke();
  textSize(60);
  textAlign(CENTER, CENTER);
  text(count, 120, 18 + 50 / 2);
  pop();
}

//function to draw the reach power up counter on the top left(extra implementation)
function reachpowerup(count){
  stroke(255);
  strokeWeight(2);
  noFill();
  
  fill(255, 220, 185);
  ellipse(180, 50, 40, 50); 
  
  fill(255, 220, 185);
  ellipse(180, 70, 30, 15); 

  push();
  fill(255); 
  noStroke();
  textSize(60); 
  textAlign(CENTER, CENTER);
  text(count, 240, 18 + 50 / 2); 
  pop();
}

//function to draw the aim assist line when users toggle it on
function drawAimAssistLine(x, y, angle) {
  if (!toggleAimAssist) return;
  let trajectoryLength = 200;
  
  let endX = x - cos(angle) * trajectoryLength;
  let endY = y - sin(angle) * trajectoryLength;
  
  stroke(255); 
  strokeWeight(3);
  line(x, y, endX, endY);
  
}

//This is the extra implementation
//sound effect for the ball collision by using howler 
const ballCollisionSound = new Howl({
  src: ['assets/ball-collision.mp3'], 
  volume: 0.5,
});

const cushionCollisionSound = new Howl({
  src: ['assets/cushion-collision.mp3'],
  volume: 0.5,
});


//listen for collision between the balls and cushion
function handleCollisions(event) {
  const pairs = event.pairs;

  pairs.forEach((pair) => {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    const isBallA = bodyA.label === 'Ball';
    const isBallB = bodyB.label === 'Ball';

    //case 1: Collision between two balls
    if (isBallA && isBallB) {
      const ballAName = bodyA.name;
      const ballBName = bodyB.name; 

      if ((ballAName === 'cue' && ballBName === 'red') || (ballAName === 'red' && ballBName === 'cue')) {
        showText = true;
        textMessage = "Collision Detected: Cue Ball and Red Ball"
      }else if (ballAName === "cue" || ballBName === "cue"){
        showText = true;
        textMessage = "Collision Detected: Cue Ball and Coloured Ball"
      }

      //play ball-to-ball collision sound
      ballCollisionSound.play();

      //exit to avoid processing as ball-rectangle collision
      return; 
    }

    //case 2: Collision between a ball and a rectangle
    const isBallAndRectangle =
      (isBallA && bodyB.label === 'cushion') ||
      (isBallB && bodyA.label === 'cushion');

    if (isBallAndRectangle) {
      const ball = isBallA ? bodyA : bodyB;

      if (ball.name == "cue"){
        showText = true;
        textMessage = "Collision Detected: Cue Ball and Cushion"
      }

      cushionCollisionSound.play();
    }
  });
}

function setup() {
  //creating canvas big enough for the table and instructions
  createCanvas(1920, 1080, WEBGL);
  engine = Matter.Engine.create();
  engine.world.gravity.y = 0;
  

  table.initBoundaries();
  table.initPockets();

  //adding collision event listener
  Matter.Events.on(engine, 'collisionStart', handleCollisions);

  Matter.Runner.run(engine);
  textFont(myFont);
}

function draw(){
  background(220);

  //webGL mode: Adjust origin to top-left
  translate(-width / 2, -height / 2);

  //draw the table background
  image(tableTexture, 0, 0, 1920, 1080);

  //draw the balls
  balls.forEach((ball) => {
    ball.display();
  });   
  
  //check if any balls have been pocketed
  table.checkPockets();
  
  //draw the cue
  if (cuestick) {
    
    let angle = atan2(mouseY - cueBall.body.position.y, mouseX - cueBall.body.position.x);
    cueStickDist = dist(cueBall.body.position.x, cueBall.body.position.y, mouseX, mouseY);


    //limit the distance to the max distance (incease the max distance if there reachPowerup is activated)
    if (toggleReach){
      cueStickDist = min(cueStickDist, cuestickMaxDist+100);
      if (reachPowerup <= 0){
        toggleReach= false;
      }
    }else{
      cueStickDist = min(cueStickDist, cuestickMaxDist);
    }
    

    //calculate the pivot position of the cue stick
    let pivotX = cueBall.body.position.x + cos(angle) * cueStickDist;
    let pivotY = cueBall.body.position.y + sin(angle) * cueStickDist;


    //draw the cue stick
    drawCueStick(pivotX, pivotY, cueBall.body.position.x, cueBall.body.position.y);
    
    let forcebar = map(cueStickDist, 0, cuestickMaxDist, 0, 100);
    forcebar = constrain(forcebar, 0, 100);

    drawForceBar(forcebar);

    //if toggleAimAssist is true, aim assist will show
    if (toggleAimAssist){
      drawAimAssistLine(cueBall.body.position.x, cueBall.body.position.y, angle); 
      if (powerUp <= 0){
        toggleAimAssist = false;
      }
    }
  }

  //if text exist, it will draw the textbox for collision detection
  if (showText){
    drawTextBox(textMessage);
  }

  //powerup UI
  aaPowerUp(powerUp);
  reachpowerup(reachPowerup);

  //apply force
  applyForce();

  //initialize the d-zone
  Dzone();

  //initialize the drawdebug
  DrawDebug();

}