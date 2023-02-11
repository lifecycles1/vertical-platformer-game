class Sprite {
  constructor({ position, imageSrc, frameRate = 1, frameBuffer = 3, scale = 1 }) {
    this.position = position;
    this.scale = scale;
    this.loaded = false;
    this.image = new Image();
    // declaring the new width and height properties for the Player Sprite based on the images' width
    // and height by monitoring when the image loads and grabbing its width and height
    this.image.onload = () => {
      // setting this.width and this.height from the image's width and height
      this.width = (this.image.width / this.frameRate) * this.scale; // adding frameRate to divide the image into 8 frames and adding scale to scale the image
      this.height = this.image.height * this.scale;
      this.loaded = true;
    };
    this.image.src = imageSrc;
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.frameBuffer = frameBuffer;
    this.elapsedFrames = 0;
  }

  draw() {
    if (!this.image) return;
    const cropbox = {
      position: {
        x: this.currentFrame * (this.image.width / this.frameRate),
        y: 0,
      },
      width: this.image.width / this.frameRate,
      height: this.image.height,
    };
    // original drawImage code
    // c.drawImage(this.image, this.position.x, this.position.y);
    // drawImage code with cropbox fitted to crop the image from the top left corner (split the 8 images from the idle.png to render 1 by 1)
    c.drawImage(this.image, cropbox.position.x, cropbox.position.y, cropbox.width, cropbox.height, this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.updateFrames();
  }

  updateFrames() {
    this.elapsedFrames++;
    if (this.elapsedFrames % this.frameBuffer === 0) {
      if (this.currentFrame < this.frameRate - 1) this.currentFrame++;
      else this.currentFrame = 0;
    }
  }
}
