/*
 A simple demo of a PID control loop I created to demonstrate the concept to my co-workers.
 Copyright (C) 2015  Eliott Wiener

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
(function() {
	"use strict";

	// default parameter values
	var proportional_gain = .2;
	var integral_gain = .15;
	var derivative_gain = .03;
	var freq = 15;

	var ctx;
	var cnvs;
	var cnvs_size = function(dim){
		if(dim === 'x'){
			return cnvs.width;
		} else if(dim === 'y'){
			return cnvs.height;
		}
	}

	var setpoint = {
		'x': 0,
		'y': 0
	};

	var mouse = {
		'x': 0,
		'y': 0
	};

	var ball_position = {
		'x': 0,
		'y': 0
	};

	var ball_velocity = {
		'x': 0,
		'y': 0
	};

	var error = {
		'x': 0,
		'y': 0
	};

	var last_error = {
		'x': 0,
		'y': 0
	};

	var sum_error = {
		'x': 0,
		'y': 0
	};

	var past_errors = [];

	var update_mouse = function(e) {
		var x = 0;
		var y = 0;
		if (e.offsetX) {
			x = e.offsetX;
			y = e.offsetY;
		} else if (e.layerX) {
			x = e.layerX;
			y = e.layerY;
		}
		mouse = {
			'x': x,
			'y': y
		};
	};

	var copy_2vec = function(v) {
		return {
			'x': v.x,
			'y': v.y
		};
	};

	var control_loop = function() {
		setpoint = copy_2vec(mouse);
		['x', 'y'].forEach(function(dim){
			error[dim] = setpoint[dim] - ball_position[dim];
			var velocity = proportional_gain * error[dim];
			sum_error[dim] += error[dim];
			velocity += integral_gain * sum_error[dim];
			var error_slope = error[dim] - last_error[dim];
			velocity += derivative_gain * error_slope;
			ball_velocity[dim] = velocity;
			last_error[dim] = error[dim];
		});

		// keep these for charting
		past_errors.unshift(copy_2vec(error));
		if (past_errors.length > cnvs.width && past_errors.length > cnvs.height) {
			past_errors.pop();
		}

		setTimeout(control_loop, 1000 / freq);
	};

	var world_tick = function() {
		['x','y'].forEach(function(dim){
			ball_position[dim] += ball_velocity[dim];

			// keep ball in bounds
			if (ball_position[dim] > cnvs_size(dim)) {
				ball_position[dim] = cnvs_size(dim);
			}
			if (ball_position[dim] < 0) {
				ball_position[dim] = 0;
			}
		});
		draw();
		window.requestAnimationFrame(world_tick);
	};

	var draw = function() {
		var e, offset, _i, _j, _len, _len1;

		ctx.clearRect(0, 0, cnvs.width, cnvs.height);
		ctx.font = "16px sans-serif";

		//draw Y-axis error graph
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


		//draw X-axis error graph
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

		//draw red circle
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(ball_position.x, ball_position.y, 20, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'red';
		ctx.fill();
		return ctx.stroke();
	};

	var update_vars = function() {
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

	var submit = function(e) {
		e.preventDefault()
		update_vars()
	}

	var winch = function() {
		cnvs.width = window.innerWidth;
		cnvs.height = 500;
		update_vars();
	};

	window.onload = function() {
		window.pbox = document.getElementById('pbox');
		window.ibox = document.getElementById('ibox');
		window.dbox = document.getElementById('dbox');
		window.fbox = document.getElementById('fbox');
		window.controls = document.getElementById('controls');
		window.pbox.value = proportional_gain;
		window.ibox.value = integral_gain;
		window.dbox.value = derivative_gain;
		window.fbox.value = freq;
		cnvs = document.getElementById('cnvs');
		ball_position.x = cnvs.width / 2;
		ball_position.y = cnvs.height / 2;
		ctx = cnvs.getContext('2d');
		cnvs.addEventListener('mousemove', update_mouse)
		window.controls.addEventListener("submit", submit);
		window.addEventListener('resize', winch);
		winch();
		window.requestAnimationFrame(world_tick);
		return control_loop();
	};

}).call(this);
