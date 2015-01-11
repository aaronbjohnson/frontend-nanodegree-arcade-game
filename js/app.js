var PLAYER_START_X = 200,
    PLAYER_START_Y = 300, 
    STRIDE_LENGTH_X = 101,
    STRIDE_LENGTH_Y = 83,
    PLAYER_X_OFFSET = 17,
    PLAYER_Y_OFFSET = 41.5;

var SAFE_ZONE = 83,
    LEFT_WALL = -5,
    RIGHT_WALL = 500,
    TOP_WALL = -100,
    BOTTOM_WALL = 450;

var ENEMY_Y_OFFSET = 80;
    ENEMY_X_STARTS = [-300, -200, -100, -50],
    ENEMY_Y_STARTS = [(60 + ENEMY_Y_OFFSET), (140 + ENEMY_Y_OFFSET), (225 + ENEMY_Y_OFFSET)],
    ENEMY_MAX_SPEED = 5,
    ENEMY_MIN_SPEED = 1,
    ENEMY_FRAME = {
        "left offset": 3,
        "top offset": 90,
        "sprite width": 100,
        "sprite height": 170 
    }

var SPEED_VARIATION = function() {
  return getRandomInt(ENEMY_MIN_SPEED, ENEMY_MAX_SPEED);
}


// Adding a function to detect collisions. Referenced: http://www.html5rocks.com/en/tutorials/canvas/notearsgame/

/*
var COLLIDES (a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}
*/
/*
var HANDLE_COLLISIONS = function() {
  allEnemies.forEach(function(Enemy)) {
    if (COLLIDES(Enemy, Player)) {
      Player.reset();
    }
  }
}
*/

//This start of the variables I'm getting from the pew pew guy
var CANVAS_WIDTH = 505;
var CANVAS_HEIGHT = 606;

//Utility 

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * <pre>
 * (x * 255).clamp(0, 255)
 * </pre>
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */

//Used to generate random numbers. Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var Status = function() {
  this.health = 3;
  this.level = 1;

}



//Create a super class called Character.
//Referenced KevDonk's system of Superclass...x y sprite
var Character = function() {
 
}

Character.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Enemies our player must avoid
var Enemy = function() {
  this.active = true;
  this.xVelocity = SPEED_VARIATION();
  this.yVelocity = 0;

  this.width = 99;
  this.height = 30;

    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
  this.sprite = 'images/laser.png';
  this.x = this.getRandomX();
  this.y = this.getRandomY();

  // Define the area of the sprite for use in detecting collisions. Ref: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  //this.area = {this.x, this.y, this.width, this.height}

    //Referenceing http://arcadegame2000.appspot.com/ for the speed system.
}

Enemy.prototype = Object.create(Character.prototype); 
Enemy.prototype.constructor = Enemy;

Enemy.prototype.render = function() {
  Character.prototype.render.call(this);
}

Enemy.prototype.inBounds = function() {
    return this.x >= 0 && this.x <= CANVAS_WIDTH && this.y >= 0 && this.y <=CANVAS_HEIGHT;
  }


// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {

  this.x += this.xVelocity * dt * 100;
  this.y += this.yVelocity * dt * 100;

  if (this.x > CANVAS_WIDTH) {
    this.reset();
  }

 // this.active = this.active && this.inBounds();
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

  //maybe here you could add variable to replace 100 that fluctuates.
    //var move = (this.speed * 100 * dt) + this.x; 

/*

    if(this.x > RIGHT_WALL) {
      this.reset();
      //this.setCollisionFrame(ENEMY_FRAME);
    }

    else {
        //this.x = newX;   
        //this.setCollisionFrame(ENEMY_FRAME);
    }

*/

}


Enemy.prototype.reset = function() {
  this.x = this.getRandomX();
  this.y = this.getRandomY();
  this.xVelocity = SPEED_VARIATION();
}

// Got this from Aracade2000 guy
Enemy.prototype.getRandomX = function() {
    // Get valid random index for ENEMY_X_STARTS array
    var len = ENEMY_X_STARTS.length;
    var rand = getRandomInt(0, len);

    return ENEMY_X_STARTS[rand];
}

Enemy.prototype.getRandomY = function() {
    // Get valid random index for ENEMY_Y_STARTS array
    var len = ENEMY_Y_STARTS.length;
    var rand = getRandomInt(0, len);

    return ENEMY_Y_STARTS[rand];
}


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function() {
  this.sprite = 'images/char-boyA.png';
  this.x = (STRIDE_LENGTH_X * 2) + PLAYER_X_OFFSET;
  this.y = (STRIDE_LENGTH_Y * 4) + PLAYER_Y_OFFSET;
  this.width = 67;
  this.height = 88;
  this.health = 3;
  this.level = 1;
}

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.render = function() {
  Character.prototype.render.call(this);
  if (this.health > 0) {
    ctx.fillStyle = "#111111";
    ctx.font = "Bold 18px Helvetica";
    ctx.fillText("Level: " + this.level, 15, 575);
    ctx.fillText("Health: " + this.health, 415, 575);
  }

  if (this.health == 0) {
    ctx.fillStyle = "#111111";
    ctx.font = "Bold 30px Helvetica";
    ctx.fillText("GAME OVER", 155, 185);
    ctx.fillText("You reached level " + this.level, 115, 265);
  }
  
}

Player.prototype.update = function(dt) {

  var collides = this.handleCollisions();

  if (collides) {
    this.reset();
    this.health--;
  }

  if (this.health == 0) {
    this.sprite ='images/enemy-bugA.png';
    gameOver();
  }

  var safe = this.safeZone();

  if (safe && this.health > 0) {
    this.reset();
    this.level++;
  }


}

Player.prototype.safeZone = function() {
  if (this.y < 50) {
    return true;
  }

  return false;
}

Player.prototype.handleCollisions = function() {
  
  for (i in allEnemies) {
   if (player.x < allEnemies[i].x + allEnemies[i].width &&
    player.x + player.width > allEnemies[i].x &&
    player.y < allEnemies[i].y + allEnemies[i].height &&
    player.height + player.y > allEnemies[i].y) {
      return true;
    }
  }

  return false;
}


Player.prototype.move = function(movement) {
  switch(movement) {
    case 'left':
      this.x -= STRIDE_LENGTH_X;
      break;
    case 'up':
      this.y -= STRIDE_LENGTH_Y;
      break;
    case 'right':
      this.x += STRIDE_LENGTH_X;
      break;
    case 'down':
      this.y += STRIDE_LENGTH_Y;
      break;
    default:
      break;
  }
}
//Referenced KevDonk's handleInput prototype to keep player in bounds
Player.prototype.handleInput = function(keydown) {
  if(keydown == 'right' && this.x < 400) {
    this.move('right');
  }

  if(keydown == 'left' && this.x > 100) {
    this.move('left');
  }

  if(keydown == 'down' && this.y < 400) {
    this.move('down');
  }

  if(keydown == 'up' && this.y > 82) {
    this.move('up');
  }
}

Player.prototype.reset = function() {
  this.x = (STRIDE_LENGTH_X * 2) + PLAYER_X_OFFSET;
  this.y = (STRIDE_LENGTH_Y * 4) + PLAYER_Y_OFFSET;
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var player = new Player();
var allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy()];



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
