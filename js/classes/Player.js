class Player extends Sprite {
  constructor({ position, collisionBlocks, platformCollisionBlocks, imageSrc, frameRate, scale = 0.5, animations }) {
    super({ imageSrc, frameRate, scale });
    this.position = position;
    this.velocity = { x: 0, y: 1 };
    // deprecating these static width and height of 100 which we scaled down to 25 (4 times)
    // after we scaled the canvas down by 4 times because we are now using the Sprite class to add the image
    // to our Player class and we will add new width and height properties in the Sprite class which we will use
    // to further scale the new image to the size we want.
    // this.height = 100 / 4; // 100 is the height of the original sprite
    // this.width = 100 / 4; // divided by 4 to match the scale applied to the canvas
    this.collisionBlocks = collisionBlocks;
    this.platformCollisionBlocks = platformCollisionBlocks;
    // changing the collision to this inner hitbox which will surround the exact image of the player
    // this will only run once when the player is created so we will put it in its own method updateHitbox()
    // and call the method in the update method
    this.hitbox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 10,
      height: 10,
    };
    this.animations = animations;
    this.lastDirection = "right";
    for (let key in this.animations) {
      const image = new Image();
      image.src = this.animations[key].imageSrc;
      this.animations[key].image = image;
    }
    this.camerabox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 200,
      height: 80,
    };
  }

  // deprecating this draw method because after we extended our class to inherit from the Sprite class
  // the already existing "this.draw()" in the update method calls the parents class draw method by default
  // which has the c.drawImage that adds the image to our Player class (which is what we want)
  // and because the child class "Player"'s draw method will override the parent class draw method -
  // we are deprecating it.
  // draw() {
  //   c.fillStyle = "red";
  //   c.fillRect(this.position.x, this.position.y, this.width, this.height);
  // }

  switchSprite(key) {
    if (this.image === this.animations[key].image || !this.loaded) return;

    this.currentFrame = 0;
    this.image = this.animations[key].image;
    this.frameBuffer = this.animations[key].frameBuffer;
    this.frameRate = this.animations[key].frameRate;
  }

  updateCamerabox() {
    this.camerabox = {
      position: {
        x: this.position.x - 50,
        y: this.position.y,
      },
      width: 200,
      height: 80,
    };
  }

  // make sure the player does not fall off the side of screen by
  // stopping the player's movement when the player's hitbox is colliding with the end of the canvas
  // also add the player's velocity to the width of the hitbox so we predict 1 frame in advance and
  // in this case the player won't get stuck on the edge of the canvas and will be able to move backwards
  checkForHorizontalCanvasCollision() {
    if (
      // if the player's hitbox is colliding with the right side of the canvas
      this.hitbox.position.x + this.hitbox.width + this.velocity.x >= 576 ||
      // if the player's hitbox is colliding with the left side of the canvas
      this.hitbox.position.x + this.velocity.x <= 0
    ) {
      this.velocity.x = 0;
    }
  }

  // when the right side of the camerabox is colliding with the right side of the canvas
  // we want to pan the hidden canvas towards the left
  shouldPanCameraToTheLeft({ canvas, camera }) {
    const cameraboxRightSide = this.camerabox.position.x + this.camerabox.width;
    const scaledDownCanvasWidth = canvas.width / 4;
    // if the camerabox has reached the end of the canvas - return and stop panning
    if (cameraboxRightSide >= 576) return;
    // if the camerabox has not reached the end of the canvas - pan the scene to the left
    if (cameraboxRightSide >= scaledDownCanvasWidth + Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x;
    }
  }

  // when the left side of the camerabox is colliding with the left side of the canvas
  // we want to reveal the hidden canvas towards the right
  shouldPanCameraToTheRight({ canvas, camera }) {
    // if the camerabox has reached the end of the canvas - return and stop panning
    if (this.camerabox.position.x <= 0) return;
    // if the camerabox has not reached the end of the canvas - pan the scene to the right
    if (this.camerabox.position.x <= Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x;
    }
  }

  // when the top side of the camerabox is colliding with the top side of the canvas
  // we want to reveal more hidden scene downwards
  shouldPanCameraDown({ canvas, camera }) {
    // if the camerabox has reached the top end of the canvas - return and stop panning
    if (this.camerabox.position.y + this.velocity.y <= 0) return;
    // if the camerabox has not reached the end of the canvas - pan the scene downwards as the player goes up the screen
    if (this.camerabox.position.y <= Math.abs(camera.position.y)) {
      camera.position.y -= this.velocity.y;
    }
  }

  // when the bottom side of the camerabox is colliding with the bottom side of the canvas and
  // the player is going down the screen - we want to reveal more hidden scene upwards
  shouldPanCameraUp({ canvas, camera }) {
    // if the camerabox has reached the bottom end of the canvas - return and stop panning
    // if there is no solid ground to step on - the player will fall off the screen and we don't want to reveal more scene upwards
    // 432 is the total height of this particular background image
    if (this.camerabox.position.y + this.camerabox.height + this.velocity.y >= 432) return;
    // if the camerabox has not reached the end of the canvas - reveal more scene upwards as the player falls down the screen
    const scaledDownCanvasHeight = canvas.height / 4;
    if (this.camerabox.position.y + this.camerabox.height >= Math.abs(camera.position.y) + scaledDownCanvasHeight) {
      camera.position.y -= this.velocity.y;
    }
  }

  update() {
    this.updateFrames();
    this.updateHitbox();

    this.updateCamerabox();
    // // this draws the camerabox
    // c.fillStyle = "rgba(0, 0, 255, 0.2)";
    // c.fillRect(this.camerabox.position.x, this.camerabox.position.y, this.camerabox.width, this.camerabox.height);

    // // this draws around the image of the player
    // c.fillStyle = "rgba(0, 255, 0, 0.2)";
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);

    // // this draws around the hitbox of the player
    // c.fillStyle = "rgba(255, 0, 0, 0.2)";
    // c.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);

    this.draw();
    this.position.x += this.velocity.x;
    this.updateHitbox();
    this.checkForHorizontalCollisions();
    this.applyGravity();
    this.updateHitbox();
    this.checkForVerticalCollisions();
  }

  updateHitbox() {
    this.hitbox = {
      position: {
        x: this.position.x + 35,
        y: this.position.y + 26,
      },
      width: 14,
      height: 27,
    };
  }

  // want to check for horizontal collisions before vertical collisions and gravity
  // because if we check for vertical collisions first, the player will be stuck
  // in the ground and will not be able to move horizontally.
  checkForHorizontalCollisions() {
    // loop through all collision blocks
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      // get the current collision block
      const collisionBlock = this.collisionBlocks[i];
      // check for collision
      if (
        collision({
          // original monitoring for collision on the player
          // object1: this,
          // modified to monitor for collision on the inner hitbox
          object1: this.hitbox,
          object2: collisionBlock,
        })
      ) {
        // if the player is moving right
        if (this.velocity.x > 0) {
          // stop the player from moving right
          this.velocity.x = 0;

          // inner hitbox offset
          const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;

          // move the player to the left of the collision block (tune with a small amount of 0.01 to make sure the player is not colliding for future instances)
          this.position.x = collisionBlock.position.x - offset - 0.01;
          // break just makes sure that we don't run the rest of the for loop after we collide with a block
          break;
        }
        // if the player is moving left
        if (this.velocity.x < 0) {
          // stop the player from moving left
          this.velocity.x = 0;

          // inner hitbox offset
          const offset = this.hitbox.position.x - this.position.x;

          // move the player to the right of the collision block (tune with a small amount of 0.01 to make sure the player is not colliding for future instances)
          this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01;
          break;
        }
      }
    }
  }

  // pulls the player down towards the ground
  applyGravity() {
    this.velocity.y += gravity; // swapped the order of these two lines to prevent the player from glitching when they are on the ground between Fall and Idle state
    this.position.y += this.velocity.y;
  }

  checkForVerticalCollisions() {
    // ground collision blocks
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];
      if (
        collision({
          // original monitoring for collision on the player
          // object1: this,
          // modified to monitor for collision on the inner hitbox
          object1: this.hitbox,
          object2: collisionBlock,
        })
      ) {
        // if the player is falling
        if (this.velocity.y > 0) {
          // stop the player from falling
          this.velocity.y = 0;

          // inner hitbox offset
          const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;

          // move the player to the top of the collision block (tune with a small amount of 0.01 to prevent jittering)
          // by adding the small amount we are making sure that the player is not colliding for future instances
          //  in order to detect a further horizontal collision
          this.position.y = collisionBlock.position.y - offset - 0.01;
          break;
        }
        // if the player is jumping
        if (this.velocity.y < 0) {
          // stop the player from jumping
          this.velocity.y = 0;

          // inner hitbox offset
          const offset = this.hitbox.position.y - this.position.y;

          // move the player to the bottom of the collision block
          this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01;
          break;
        }
      }
    }

    // platform collision blocks
    for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
      const platformCollisionBlock = this.platformCollisionBlocks[i];
      if (
        platformCollision({
          object1: this.hitbox,
          object2: platformCollisionBlock,
        })
      ) {
        // if the player is falling
        if (this.velocity.y > 0) {
          // stop the player from falling
          this.velocity.y = 0;

          // inner hitbox offset
          const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;

          // move the player to the top of the collision block (tune with a small amount of 0.01 to prevent jittering)
          // by adding the small amount we are making sure that the player is not colliding for future instances
          //  in order to detect a further horizontal collision
          this.position.y = platformCollisionBlock.position.y - offset - 0.01;
          break;
        }
      }
    }
  }
}
