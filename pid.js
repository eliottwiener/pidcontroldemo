// A simple demo of a PID control loop I created to demonstrate the concept to my co-workers.
// Copyright (C) 2015  Eliott Wiener
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

(function() {
  var ball_position, ball_velocity, cnvs, control_loop, copy_2vector, ctx, derivative_gain, draw, error, freq, integral_gain, last_error, mouse, past_errors, proportional_gain, setpoint, sum_error, update_mouse, update_vars, winch, world_tick;

  proportional_gain = .2;

  integral_gain = .15;

  derivative_gain = .03;

  freq = 15;

  ctx = {};

  cnvs = {};

  setpoint = {
    'x': 0,
    'y': 0
  };

  mouse = {
    'x': 0,
    'y': 0
  };

  ball_position = {
    'x': 0,
    'y': 0
  };

  ball_velocity = {
    'x': 0,
    'y': 0
  };

  error = {
    'x': 0,
    'y': 0
  };

  last_error = {
    'x': 0,
    'y': 0
  };

  sum_error = {
    'x': 0,
    'y': 0
  };

  past_errors = [];

  update_mouse = function(e) {
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

  copy_2vector = function(v) {
    return {
      'x': v.x,
      'y': v.y
    };
  };

  control_loop = function() {
    var dim, error_slope, velocity, _i, _len, _ref;
    setpoint = copy_2vector(mouse);
    _ref = ['x', 'y'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dim = _ref[_i];
      error[dim] = setpoint[dim] - ball_position[dim];
      velocity = proportional_gain * error[dim];
      sum_error[dim] += error[dim];
      velocity += integral_gain * sum_error[dim];
      error_slope = error[dim] - last_error[dim];
      velocity += derivative_gain * error_slope;
      ball_velocity[dim] = velocity;
      last_error[dim] = error[dim];
    }
    past_errors.unshift(copy_2vector(error));
    if (past_errors.length > cnvs.width) {
      past_errors.pop();
    }
    return setTimeout(control_loop, 1000 / freq);
  };

  world_tick = function() {
    ball_position.x += ball_velocity.x;
    ball_position.y += ball_velocity.y;
    if (ball_position.y > cnvs.height) {
      ball_position.y = cnvs.height;
    }
    if (ball_position.x > cnvs.width) {
      ball_position.x = cnvs.width;
    }
    if (ball_position.x < 0) {
      ball_position.x = 0;
    }
    if (ball_position.y < 0) {
      ball_position.y = 0;
    }
    draw();
    return window.requestAnimationFrame(world_tick);
  };

  draw = function() {
    var e, offset, _i, _j, _len, _len1;
    ctx.clearRect(0, 0, cnvs.width, cnvs.height);
    ctx.font = "16px sans-serif";
    ctx.strokeStyle = 'green';
    ctx.fillStyle = 'green';
    ctx.fillText("Time →", 10, 26);
    ctx.beginPath();
    ctx.moveTo(0, cnvs.height / 2);
    offset = 0;
    for (_i = 0, _len = past_errors.length; _i < _len; _i++) {
      e = past_errors[_i];
      ctx.lineTo(offset, (cnvs.height / 2) + e.y, 1, 1);
      offset += 1;
    }
    ctx.stroke();
    ctx.strokeStyle = 'orange';
    ctx.fillStyle = 'orange';
    ctx.fillText("Time ↓", 10, 46);
    ctx.beginPath();
    ctx.moveTo(cnvs.width / 2, 0);
    offset = 0;
    for (_j = 0, _len1 = past_errors.length; _j < _len1; _j++) {
      e = past_errors[_j];
      ctx.lineTo((cnvs.width / 2) + e.x, offset, 1, 1);
      offset += 1;
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ball_position.x, ball_position.y, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'red';
    ctx.fill();
    return ctx.stroke();
  };

  update_vars = function(e) {
    if (e) {
      e.preventDefault();
    }
    if (window.controls.checkValidity()) {
      proportional_gain = window.pbox.value;
      integral_gain = window.ibox.value;
      derivative_gain = window.dbox.value;
      freq = window.fbox.value;
      setpoint = {
        'x': 0,
        'y': 0
      };
      mouse = {
        'x': 0,
        'y': 0
      };
      ball_position = {
        'x': 0,
        'y': 0
      };
      ball_velocity = {
        'x': 0,
        'y': 0
      };
      error = {
        'x': 0,
        'y': 0
      };
      last_error = {
        'x': 0,
        'y': 0
      };
      sum_error = {
        'x': 0,
        'y': 0
      };
      return past_errors = [];
    }
  };

  winch = function() {
    cnvs.width = window.innerWidth;
    cnvs.height = 500;
    return update_vars(false);
  };

  window.onload = function() {
    window.pbox = document.getElementById('pbox');
    window.ibox = document.getElementById('ibox');
    window.dbox = document.getElementById('dbox');
    window.fbox = document.getElementById('fbox');
    window.submit = document.getElementById('submit');
    window.controls = document.getElementById('controls');
    window.pbox.value = proportional_gain;
    window.ibox.value = integral_gain;
    window.dbox.value = derivative_gain;
    window.fbox.value = freq;
    cnvs = document.getElementById('cnvs');
    ball_position.x = cnvs.width / 2;
    ball_position.y = cnvs.height / 2;
    ctx = cnvs.getContext('2d');
    cnvs.addEventListener('mousemove', function(e) {
      return update_mouse(e);
    });
    window.controls.addEventListener("submit", function(e) {
      return update_vars(e);
    });
    window.addEventListener('resize', winch);
    winch();
    window.requestAnimationFrame(world_tick);
    return control_loop();
  };

  window.update_vars = update_vars;

}).call(this);
