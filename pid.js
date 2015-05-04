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
	var control_loop_frequency = 15;

	var ctx;
	var cnvs;

	var cnvs_size = function(dim){
		return {
			'x': cnvs.width,
			'y': cnvs.height,
		};
	}

	// helper for calling lineTo, moveTo, etc in flipped dimensions
	var xy_call = function(f,dim,x,y){
		if(dim === 'x'){
			f(x, y);
		} else {
			f(y, x);
		}
	};

	var setpoint, mouse, ball_position, ball_velocity, error, last_error, integral, num_past_errors, past_errors;

	var reset = function(){
		var middle = { 'x': cnvs_size()['x']/2, 'y': cnvs_size()['y']/2 };
		setpoint = copy_xy(middle);
		mouse = { 'x': cnvs_size()['x']/2 + 1, 'y': cnvs_size()['y']/2 };
		ball_position = copy_xy(middle);
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

	var update_touch = function(e) {
		e.preventDefault();
		var x = e.targetTouches[0].pageX - cnvs.offsetLeft;
		var y = e.targetTouches[0].pageY - cnvs.offsetTop;
		mouse = {
			'x': x,
			'y': y
		};
	}

	var copy_xy = function(v) {
		return {
			'x': v.x,
			'y': v.y
		};
	};

	var control_loop = function() {
		setpoint = copy_xy(mouse);
		['x', 'y'].forEach(function(dim){
			error[dim] = setpoint[dim] - ball_position[dim];
			integral[dim] = integral[dim] + error[dim]*control_loop_frequency
			var derivative = (error[dim] - last_error[dim])/control_loop_frequency
			var output = proportional_gain * error[dim]
			output += integral_gain * integral[dim]
			output += derivative_gain * derivative
			last_error[dim] = error[dim];
			ball_velocity[dim] = output;
		});

		// keep these for charting
		past_errors.unshift(copy_xy(error));
		if (past_errors.length > num_past_errors) {
			past_errors.pop();
		}

		setTimeout(control_loop, 1000 / control_loop_frequency);
	};

	var world_tick = function() {
		['x','y'].forEach(function(dim){
			ball_position[dim] += ball_velocity[dim];
		});
	};

	var draw_chart = function(dim, color){
		ctx.strokeStyle = color;
		ctx.beginPath();
		xy_call(function(a,b){ctx.moveTo(a,b)}, dim, cnvs_size()[dim] / 2, 0);
		past_errors.forEach(function(e, i){
			xy_call(function(a,b){ctx.lineTo(a,b)}, dim, cnvs_size()[dim] / 2 + e[dim], i);
		});
		ctx.stroke();
	}

	var draw = function() {
		ctx.clearRect(0, 0, cnvs.width, cnvs.height);

		ctx.font = "10px sans-serif";
		ctx.fillStyle = 'green';
		ctx.fillText("Time ↓", 5, 20);
		ctx.fillStyle = 'orange';
		ctx.fillText("Time →", 5, 10);
		draw_chart('x','green');
		draw_chart('y','orange');

		ctx.beginPath();
		ctx.arc(ball_position.x, ball_position.y, 20, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.stroke();
	};

	var main_loop = function(){
		world_tick();
		draw();
		window.requestAnimationFrame(main_loop);
	}

	var update_vars = function() {
		if (window.controls.checkValidity()) {
			proportional_gain = window.proportional_box.value;
			integral_gain = window.integral_box.value;
			derivative_gain = window.derivative_box.value;
			control_loop_frequency = window.frequency_box.value;
			if (control_loop_frequency > 30){
				control_loop_frequency = 30;
				window.frequency_box.value = 30;
			}
			reset();
		}
	};

	var submit = function(e) {
		e.preventDefault()
		update_vars()
	}

	var winch = function() {
		cnvs.width = window.innerWidth;
		cnvs.height = window.innerHeight - window.controls.offsetHeight;
		update_vars();
	};

	window.onload = function() {
		window.proportional_box = document.getElementById('proportional_box');
		window.integral_box = document.getElementById('integral_box');
		window.derivative_box = document.getElementById('derivative_box');
		window.frequency_box = document.getElementById('frequency_box');
		window.controls = document.getElementById('controls');
		window.proportional_box.value = proportional_gain;
		window.integral_box.value = integral_gain;
		window.derivative_box.value = derivative_gain;
		window.frequency_box.value = control_loop_frequency;
		cnvs = document.getElementById('cnvs');
		ctx = cnvs.getContext('2d');
		reset();
		cnvs.addEventListener('mousemove', update_mouse);
		cnvs.addEventListener('touchmove', update_touch);
		window.controls.addEventListener("submit", submit);
		window.addEventListener('resize', winch);
		winch();
		control_loop();
		main_loop();
	};

}).call(this);
