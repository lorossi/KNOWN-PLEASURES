class Sketch extends Engine {
  preload() {
    this._waves_num = 40;
    this._duration = 600;
    this._border = 0.25;
    this._time_scl = 0.75;
    this._min_relative_height = 0.6;
    this._animating = true;
    this._recording = true;
  }

  setup() {
    // setup capturer
    this._capturer_started = false;
    if (this._recording) {
      this._capturer = new CCapture({ format: "png" });
    }
    // setup noise
    this._noise = new SimplexNoise();
    // create waves
    this._waves = [];
    // spacing between lines
    const spacing = (this.height * (1 - this._border)) / (this._waves_num + 1);
    // line width
    const wave_width = this.width * (1 - this._border);
    // wave x coordinate
    const wx = (this.width * this._border) / 2;
    for (let i = 0; i < this._waves_num; i++) {
      // height percent
      const y_percent =
        1 - (Math.abs(i - this._waves_num / 2) / this._waves_num) * 2;
      // easing
      const y_easing = easeInOut(
        clamp(y_percent, this._min_relative_height, 1)
      );
      // wave y coordinate
      const wy = spacing * (i + 1);
      this._waves.push(
        new Wave(wx, wy, wave_width, spacing * y_easing, this._noise)
      );
    }
  }

  draw() {
    // start capturer
    if (!this._capturer_started && this._recording) {
      this._capturer_started = true;
      this._capturer.start();
      console.log("%c Recording started", "color: green; font-size: 2rem");
    }

    // percent of time elapsed
    const percent = (this.frameCount % this._duration) / this._duration;
    // time coordinates calculation, relative to noise
    const time_theta = percent * Math.PI * 2;
    const tx = this._time_scl * (10 + Math.cos(time_theta));
    const ty = this._time_scl * (10 + Math.sin(time_theta));

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(0, (this._border * this.height) / 2);
    // draw and move all lines
    this._waves.forEach((w) => {
      w.move(tx, ty);
      w.show(this.ctx);
    });

    this.ctx.restore();
    // handle recording
    if (this._recording) {
      if (this.frameCount % 60 == 0) {
        const update = `Record: ${parseInt(percent * 100)}%`;
        console.log(`%c ${update}`, "color: yellow; font-size: 0.75rem");
      }
      if (this.frameCount < this._duration) {
        this._capturer.capture(this._canvas);
      } else {
        this._recording = false;
        this._capturer.stop();
        this._capturer.save();
        console.log("%c Recording ended", "color: red; font-size: 2rem");
      }
    }

    if (percent == 0 && this.frameCount > 0) console.log("ENDED");

    if (!this._animating) this.noLoop();
  }

  click() {
    if (!this._recording && !this._animating) {
      this.setup();
      this.loop();
    }
  }
}

const easeInOut = (x) => Math.sin((Math.PI * x) / 2) ** 4;
const clamp = (x, min = 0, max = 1) => Math.min(Math.max(x, min), max);
