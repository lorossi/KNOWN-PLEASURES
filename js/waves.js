class Wave {
  constructor(x, y, w, spacing, noise) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._spacing = spacing;
    this._noise = noise;

    this._scl = 5;
    this._dy_amplification = 15;
    this._line_width = 4;
    this._noise_scl = 0.006;
    this._noise_depth = 2;
    this._border = 0.2;

    this._seed = Math.random() * 1000;
    this._dy = [];
  }

  move(tx, ty) {
    this._dy = [];
    for (let i = 0; i <= this._w; i += this._scl) {
      const nx = i * this._noise_scl;
      const n = this._generateNoise(tx, ty, nx, this._seed);

      const space_theta = Math.PI * i / this._w;
      const modulation = easeInOutSine(Math.sin(space_theta) ** 3);

      const dy = -this._spacing * n * modulation * this._dy_amplification;
      this._dy.push(dy);
    }
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";

    ctx.lineWidth = this._line_width;

    ctx.beginPath();
    ctx.moveTo(0, this._dy[0]);
    for (let i = 1; i < this._dy.length; i++) {
      ctx.lineTo((i) * this._scl, this._dy[i]);
    }
    ctx.fill();
    ctx.stroke();


    ctx.restore();
  }

  _generateNoise(x = 0, y = 0, z = 0, w = 0) {
    let n = 0;
    let total_amplification = 0;
    for (let i = 0; i < this._noise_depth; i++) {
      const amplification = Math.pow(2, -i);
      const frequency = Math.pow(2, i);
      const harmonic = this._noise.noise4D(x * frequency, y * frequency, z * frequency, w * frequency);

      n += (harmonic + 1) / 2 * amplification;
      total_amplification += amplification;
    }

    return n / total_amplification;
  }
}