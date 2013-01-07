(function() {
  var ball, cnvs, controlLoop, ctx, derivativeGain, freq, getMouse, integralGain, mouse, oldError, proportionalGain, sumError, updateMouse, updateVars, worldTick;

  proportionalGain = 0;

  integralGain = 0;

  derivativeGain = 0;

  freq = 30;

  sumError = 0;

  ctx = {};

  cnvs = {};

  mouse = {
    'x': 0,
    'y': 0
  };

  ball = {
    'x': 0,
    'y': 0,
    'vx': 0,
    'vy': 0
  };

  oldError = {
    'x': 0,
    'y': 0
  };

  updateMouse = function(e) {
    var x, y;
    if (e.offsetX) {
      x = e.offsetX;
      y = e.offsetY;
    } else if (e.layerX) {
      x = e.layerX;
      y = e.layerY;
    }
    return mouse = {
      'x': x,
      'y': y
    };
  };

  getMouse = function() {
    return {
      'x': mouse.x,
      'y': mouse.y
    };
  };

  controlLoop = function() {
    var actual, dim, error, errorSlope, newMouse, setpoint, velocity, _i, _len, _ref;
    newMouse = getMouse();
    _ref = ['x', 'y'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dim = _ref[_i];
      setpoint = newMouse[dim];
      actual = ball[dim];
      error = setpoint - actual;
      velocity = proportionalGain * error;
      sumError += error;
      velocity += integralGain * sumError;
      errorSlope = error - oldError[dim];
      velocity += derivativeGain * errorSlope;
      ball['v' + dim] = velocity;
      oldError[dim] = error;
    }
    return setTimeout(controlLoop, 1000 / freq);
  };

  worldTick = function() {
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.y > cnvs.height) ball.y = cnvs.height;
    if (ball.x > cnvs.width) ball.x = cnvs.width;
    if (ball.x < 0) ball.x = 0;
    if (ball.y < 0) ball.y = 0;
    ctx.clearRect(0, 0, cnvs.width, cnvs.height);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return window.mozRequestAnimationFrame(worldTick);
  };

  updateVars = function() {
    proportionalGain = window.pbox.value;
    integralGain = window.ibox.value;
    derivativeGain = window.dbox.value;
    freq = window.fbox.value;
    return sumError = 0;
  };

  window.onload = function() {
    window.pbox = document.getElementById('pbox');
    window.ibox = document.getElementById('ibox');
    window.dbox = document.getElementById('dbox');
    window.fbox = document.getElementById('fbox');
    window.pbox.value = proportionalGain;
    window.ibox.value = integralGain;
    window.dbox.value = derivativeGain;
    window.fbox.value = freq;
    cnvs = document.getElementById('cnvs');
    cnvs.width = window.innerWidth;
    cnvs.height = window.innerHeight;
    ball.x = window.innerWidth / 2;
    ball.y = window.innerHeight / 2;
    ctx = cnvs.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'red';
    cnvs.addEventListener('mousemove', function(e) {
      return updateMouse(e);
    });
    window.mozRequestAnimationFrame(worldTick);
    return controlLoop();
  };

  window.updateVars = updateVars;

}).call(this);
