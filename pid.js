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
	var proportional_gain = .25;
	var integral_gain = 0.01;
	var derivative_gain = 0.3;
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

	var setpoint, mouse, ball_position, ball_velocity, error, last_error, integral, num_past_errors, past_errors;

	var reset = function(){
		var middle = { 'x': cnvs_size('x')/2, 'y': cnvs_size('y')/2 };
		setpoint = copy_2vec(middle);
		mouse = { 'x': cnvs_size('x')/2 + 1, 'y': cnvs_size('y')/2 };
		ball_position = copy_2vec(middle);
		ball_velocity = { 'x': -0.01, 'y': 0.01 };
		error = { 'x': 0, 'y': 0 };
		last_error = { 'x': 0, 'y': 0 };
		integral = { 'x': 0, 'y': 0 };
		if(cnvs.width > cnvs.height){
			num_past_errors = cnvs.width;
		} else {
			num_past_errors = cnvs.height;
		}
		past_errors = [];
		for(var i = 0; i <= num_past_errors; i++){
			past_errors.push({'x':0,'y':0});
		}
	}

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
			integral[dim] = integral[dim] + error[dim]*freq
			var derivative = (error[dim] - last_error[dim])/freq
			var output = proportional_gain * error[dim]
			output += integral_gain * integral[dim]
			output += derivative_gain * derivative
			last_error[dim] = error[dim];
			ball_velocity[dim] = output;
		});

		// keep these for charting
		past_errors.unshift(copy_2vec(error));
		if (past_errors.length > num_past_errors) {
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
		ctx.clearRect(0, 0, cnvs.width, cnvs.height);
		ctx.font = "16px sans-serif";

		//draw Y-axis error graph
		ctx.strokeStyle = 'green';
		ctx.fillStyle = 'green';
		ctx.fillText("Time →", 10, 26);
		ctx.beginPath();
		ctx.moveTo(0, cnvs.height / 2);
		var offset = 0;
		past_errors.forEach(function(e, i){
			ctx.lineTo(i, (cnvs.height / 2) + e.y, 1, 1);
		});
		ctx.stroke();


		//draw X-axis error graph
		ctx.strokeStyle = 'orange';
		ctx.fillStyle = 'orange';
		ctx.fillText("Time ↓", 10, 46);
		ctx.beginPath();
		ctx.moveTo(cnvs.width / 2, 0);
		past_errors.forEach(function(e, i){
			ctx.lineTo((cnvs.width / 2) + e.x, i, 1, 1);
		});
		ctx.stroke();

		//draw red circle
		ctx.beginPath();
		ctx.arc(ball_position.x, ball_position.y, 20, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.stroke();
	};

	var update_vars = function() {
		if (window.controls.checkValidity()) {
			proportional_gain = window.pbox.value;
			integral_gain = window.ibox.value;
			derivative_gain = window.dbox.value;
			freq = window.fbox.value;
			reset();
		}
	};

	var submit = function(e) {
		e.preventDefault()
		update_vars()
	}

	var winch = function() {
		cnvs.width = window.innerWidth;
		cnvs.height = window.innerHeight - document.getElementById('description-container').offsetHeight - window.controls.offsetHeight;
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
		ctx = cnvs.getContext('2d');
		reset();
		cnvs.addEventListener('mousemove', update_mouse);
		cnvs.addEventListener('touchmove', function(e){e.preventDefault();});
		window.controls.addEventListener("submit", submit);
		window.addEventListener('resize', winch);
		winch();
		window.requestAnimationFrame(world_tick);
		control_loop();
	};

}).call(this);
