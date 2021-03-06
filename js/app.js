/**
 * Variables used to globally store numbers and funnctions
 * @type {number}
 * @type {Array.<number>}
 * @const
 */

/**
 * TODO: Improvment to ARcade game: add an alert that displays instructions for
 * the game. Also add an alert at the end that tell you to refresh the page to
 * reset the game. Implement the recommended changes for the performance
 * optimization thing
 * Change name of title (tab label) for the arcade game 
 */

function welcomeScreen() {
    var newLine = "\r\n"
    var message = 'Welcome to Laser Dash! The goal is to avoid the lasers and ';
        message += 'move the Robot character from the red zone at the bottom ';
        message += 'of the screen to the orange zone at the top of the screen.';
        message += newLine + newLine;
        message += 'As you progress through the levels the speed of the lasers will increase.';
        message += newLine + newLine;
        message += 'Health packs that spawn on the last row can be collected to increase the health of the Robot.';
        message += newLine + newLine;
        message += 'Controls:';
        message += newLine;
        message += 'Move left - left arrow key';
        message += newLine;
        message += 'Move right - right arrow key';
        message += newLine;
        message += 'Move up - up arrow key';
        message += newLine;
        message += 'Move down - down arrow key';
        message += newLine + newLine;
        message += 'Refresh the page to reset the game.';
        message += newLine + newLine;
        message += 'Thanks for playing!';

    alert(message);
}
window.onload = welcomeScreen;

var STRIDE_LENGTH_X = 101,
    STRIDE_LENGTH_Y = 83,
    PLAYER_X_OFFSET = 17,
    PLAYER_Y_OFFSET = 41.5;

var ENEMY_X_STARTS = [-300, -200, -100, -50],
    ENEMY_Y_STARTS = [135, 220, 300],
    ENEMY_MAX_SPEED = 5,
    ENEMY_MIN_SPEED = 1;

var HEALTH_X_STARTS = [34, 135, 236, 337, 438],
    HEALTH_Y_STARTS = 30;

var NEW_LEVEL_AUDIO = new Audio("audio/newLevel.mp3"),
    HIT_AUDIO = new Audio("audio/ouch.mp3"),
    REPAIR_AUDIO = new Audio("audio/repairs.mp3"),
    LASER_AUDIO = new Audio("audio/pew.mp3");

/**
 * Returns a random number between Enemy's minimum and maximum
 *    speeds.
 */
var SPEED_VARIATION = function() {
    return getRandomInt(ENEMY_MIN_SPEED, ENEMY_MAX_SPEED);
};

/**
 * Clears the game board of lasers and health packs.
 */
var gameOver = function() {
    allEnemies = [];
    healthPack = false;
};

/**
 * Global variable used to trigger an increase in laser velocity
 *    when Player reaches a new level. 
 */
var speedMultiplier = 1;

var CANVAS_WIDTH = 505,
    CANVAS_HEIGHT = 606;


/**
 * Returns a random integer between min (included) and max (excluded)
 * Using Math.round() will give you a non-uniform distribution!
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/
 *     Reference/Global_Objects/Math/random
 * @param {number} minimum value.
 * @param {number} maximum value.
 * @return {number}
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Constructors
var Character = function() {
};

Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Create lasers that shoot across the screen. 
 * @constructor
 */
var Enemy = function() {
    this.active = true;
    this.xVelocity = 2;
    this.yVelocity = 0;
    this.width = 99;
    this.height = 30;
    this.sprite = 'images/laser.png';
    this.x = this.getRandomX();
    this.y = this.getRandomY();
};

Enemy.prototype = Object.create(Character.prototype); 
Enemy.prototype.constructor = Enemy;

Enemy.prototype.render = function() {
    Character.prototype.render.call(this);
};

/**
 * Update the enemy's position, required method for game.
 * @param {number} dt is a time delta between ticks.
 */
Enemy.prototype.update = function(dt) {
    this.x += this.xVelocity * dt * 100 + speedMultiplier;
    this.y += this.yVelocity * dt * 100;

    if (this.x > CANVAS_WIDTH) {
        this.reset();
    }

    if (this.x > -10 && this.x < 5) {
        LASER_AUDIO.play();
        LASER_AUDIO.currentTime=0;
    }
};

/**
 * Resets the laser's position.
 */
Enemy.prototype.reset = function() {
    this.x = this.getRandomX();
    this.y = this.getRandomY();
    this.xVelocity = SPEED_VARIATION();
};


/**
 * Referenced https://github.com/JColuch/Web-HTML5Game-FroggerClone
 * for this system of finding a random starting position for the 
 * lasers.
 */
Enemy.prototype.getRandomX = function() {
    var len = ENEMY_X_STARTS.length;
    var rand = getRandomInt(0, len);

    return ENEMY_X_STARTS[rand];
};

Enemy.prototype.getRandomY = function() {
    var len = ENEMY_Y_STARTS.length;
    var rand = getRandomInt(0, len);

    return ENEMY_Y_STARTS[rand];
};

/**
* Create the Robot Hero that moves across the board.
* @constructor
*/
var Player = function() {
    this.sprite = 'images/robot3.png';
    this.x = (STRIDE_LENGTH_X * 2) + PLAYER_X_OFFSET;
    this.y = (STRIDE_LENGTH_Y * 4) + PLAYER_Y_OFFSET;
    this.width = 67;
    this.height = 88;
    this.health = 3;
    this.level = 1;
};

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

/**
 * Display current game level and Player health on screen.
 * Display Game Over message when health reaches 0.
 */
Player.prototype.render = function() {
    Character.prototype.render.call(this);
        if (this.health > 0) {
        ctx.fillStyle = "#111111";
        ctx.font = "Bold 18px Helvetica";
        ctx.fillText("Level: " + this.level, 15, 575);
        ctx.fillText("Health: " + this.health, 415, 575);
    }

    if (this.health === 0) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "Bold 30px Helvetica";
        ctx.fillText("GAME OVER", 155, 185);
        ctx.fillText("You reached level " + this.level, 115, 265);
        ctx.fillText("Refresh to reset", 138, 345);
    }
};

/**
 * Checks for collisions with health packs and lasers. If 
 * the player picks up a health pack, then health is
 * increased by 1. If the player is hit by a laser then
 * health is reduced by 1 and player's appearance changes.
 * If player reaches the safe zone, then the level increases.
 * @param {number} dt is a time delta between ticks.
 */
Player.prototype.update = function(dt) {
    var collides = this.handleCollisions();

    if (collides) {
        this.reset();
        HIT_AUDIO.play();
        HIT_AUDIO.currentTime=0;
        this.health--;
    }

    var healthCollected = this.healthPackCollection();

    if (healthCollected) {
        this.health++;
        REPAIR_AUDIO.play();
        REPAIR_AUDIO.currentTime=0;
        healthPack.reset();
    }

    if (this.health === 0) {
        gameOver();
    }

    switch (this.health) {
        case 1:
            this.sprite = 'images/robot1.png';
        break;
        case 2:
            this.sprite = 'images/robot2.png';
        break;
        case 3: 
            this.sprite = 'images/robot3.png';
        break;
        default:
    }

    var safe = this.safeZone();

    if (safe && this.health > 0) {
        this.reset();
        this.level++;
        NEW_LEVEL_AUDIO.play();
        NEW_LEVEL_AUDIO.currentTime=0;
        speedMultiplier++;
    }
};

/**
 * Check to see if player has reached the safe zone.
 */
Player.prototype.safeZone = function() {
    if (this.y < 50) {
        return true;
    }
    return false;
};

/**
 * Check to see if player has been hit by a laser.
 */
Player.prototype.handleCollisions = function() {
    for (var i in allEnemies) {
        if (player.x < allEnemies[i].x + allEnemies[i].width &&
            player.x + player.width > allEnemies[i].x &&
            player.y < allEnemies[i].y + allEnemies[i].height &&
            player.height + player.y > allEnemies[i].y) {
            return true;
        }
    }
    return false;
};

/**
 * Check to see if player has collided with health pack.
 */
Player.prototype.healthPackCollection = function() {
    for (var i in healthPack) {
        if (player.x < healthPack.x + healthPack.width &&
            player.x + player.width > healthPack.x &&
            player.y < healthPack.y + healthPack.height &&
            player.height + player.y > healthPack.y) {
        return true;
        }
    }
    return false;
};

/**
 * Define the movement of the Player.
 */
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
};

/**
 * Handle's the Player's movement via input from the keyboard.
 */
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
};

Player.prototype.reset = function() {
    this.x = (STRIDE_LENGTH_X * 2) + PLAYER_X_OFFSET;
    this.y = (STRIDE_LENGTH_Y * 4) + PLAYER_Y_OFFSET;
};

/**
 * Create health packs the the Player can collect in order
 *    add to the amount of lives remaining.
 * @constructor
 */
var Repair = function() {
    this.sprite = 'images/health-pack.png';
    this.x = this.getRandomX();
    this.y = 151;
    this.width = 33;
    this.height = 29;
};

Repair.prototype = Object.create(Character.prototype);
Repair.prototype.constructor = Repair;

/**
 * Returns a random position for the health pack to appear.
 */
Repair.prototype.getRandomX = function() {
    var len = HEALTH_X_STARTS.length;
    var rand = getRandomInt(0, len);

    return HEALTH_X_STARTS[rand];
};

Repair.prototype.render = function() {
    Character.prototype.render.call(this);
};

Repair.prototype.update = function(dt) {
    console.log(this.x);
};

Repair.prototype.reset = function() {
    this.x = this.getRandomX();
    this.y = 151;
};

/**
 * Instantiate the objects that appear in the game
 */
var healthPack = new Repair();
var player = new Player();
var allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy()];

/** 
 * Listens for key presses and sends the keys to the
 * Player.handleInput() method.
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
