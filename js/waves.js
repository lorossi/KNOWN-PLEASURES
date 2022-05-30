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
    this._noise_scl = 5;
    this._noise_depth = 2;
    this._border = 0.1;

    this._seed = Math.random() * 1000; // random seed for each wave
    this._dy = [];
  }

  move(tx, ty) {
    // compute vertical displacement
    this._dy = [];

    const start_x = this._border * this._w;
    const end_x = (1 - this._border) * this._w;

    for (let i = 0; i <= this._w; i += this._scl) {
      if (i < start_x || i > end_x) {
        this._dy.push(0);
      } else {
        // noise coordinate
        const x = this._map(i, start_x, end_x, 0, 1);
        const n_pos = x * this._noise_scl;
        const n = this._generateNoise(tx, ty, n_pos, this._seed);
        // angle relative to space position, used to modulate the wave
        const space_theta = Math.PI * x;
        const modulation = this._easeInOut(Math.sin(space_theta));
        // compute displacement and add to list
        const dy = -this._spacing * n * modulation * this._dy_amplification;
        this._dy.push(dy);
      }
    }
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.lineWidth = this._line_width;
    // draw all points
    ctx.beginPath();
    ctx.moveTo(0, this._dy[0]);
    this._dy.forEach((p, i) => ctx.lineTo(i * this._scl, p));

    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  _generateNoise(x = 0, y = 0, z = 0, w = 0) {
    // generate noise of multiple harmonics
    let n = 0;
    let total_amplification = 0;
    for (let i = 0; i < this._noise_depth; i++) {
      const amplification = Math.pow(2, -i);
      const frequency = Math.pow(2, i);
      const harmonic = this._noise.noise4D(
        x * frequency,
        y * frequency,
        z * frequency,
        w * frequency
      );

      n += ((harmonic + 1) / 2) * amplification;
      total_amplification += amplification;
    }

    return n / total_amplification;
  }

  _easeInOut(x, n = 2) {
    return x < 0.5
      ? Math.pow(2, n - 1) * Math.pow(x, n)
      : 1 - Math.pow(-2 * x + 2, n) / 2;
  }

  _map(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }
}
