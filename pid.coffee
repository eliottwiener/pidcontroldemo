# Proportional Gain
proportionalGain = 0

# Integral Gain
integralGain = 0

# Derivative Gain
derivativeGain = 0

# Control loop frequency (number of times run per second)
freq = 30 # times per second

sumError = 0
ctx = {}
cnvs = {}
mouse = {'x':0, 'y':0}
ball = {'x':0, 'y': 0, 'vx':0, 'vy':0}

oldError = {'x':0, 'y':0}

updateMouse = (e) ->
	if e.offsetX
		x = e.offsetX
		y = e.offsetY
	else if e.layerX
		x = e.layerX
		y = e.layerY
	mouse = {'x':x, 'y':y}

getMouse = ->
	{'x':mouse.x, 'y':mouse.y}

controlLoop = ->
	newMouse = getMouse()
	for dim in ['x','y']
		setpoint = newMouse[dim]
		actual = ball[dim]
		error = setpoint - actual
		
		velocity = proportionalGain * error
		
		sumError += error
		velocity += integralGain * sumError
		
		errorSlope = error - oldError[dim]
		velocity += derivativeGain * errorSlope
		
		# Cap ball velocity
		#if velocity > 20
		#	velocity = 20
		#if velocity < -20
		#	velocity = -20
		ball['v' + dim] = velocity
		oldError[dim] = error
	setTimeout(controlLoop, 1000/freq)

worldTick = ->
	ball.x += ball.vx
	ball.y += ball.vy

	#keep ball in bounds
	if ball.y > cnvs.height
		ball.y = cnvs.height
	if ball.x > cnvs.width
		ball.x = cnvs.width
	if ball.x < 0
		ball.x = 0
	if ball.y < 0
		ball.y = 0

	ctx.clearRect(0,0,cnvs.width,cnvs.height)
	ctx.beginPath()
	ctx.arc(ball.x,ball.y,20,0,Math.PI*2,yes)
	ctx.closePath()
	ctx.fill()
	ctx.stroke()
	window.mozRequestAnimationFrame(worldTick)

updateVars = ->
	proportionalGain = window.pbox.value
	integralGain = window.ibox.value
	derivativeGain = window.dbox.value
	freq = window.fbox.value
	sumError = 0

window.onload = ->
	window.pbox = document.getElementById('pbox')
	window.ibox = document.getElementById('ibox')
	window.dbox = document.getElementById('dbox')
	window.fbox = document.getElementById('fbox')
	window.pbox.value = proportionalGain
	window.ibox.value = integralGain
	window.dbox.value = derivativeGain
	window.fbox.value = freq
	cnvs = document.getElementById('cnvs')
	cnvs.width = window.innerWidth
	cnvs.height = window.innerHeight
	ball.x = window.innerWidth/2
	ball.y = window.innerHeight/2
	ctx = cnvs.getContext('2d')
	ctx.strokeStyle = 'black'
	ctx.fillStyle = 'red'
	cnvs.addEventListener('mousemove', (e) -> updateMouse(e))
	window.mozRequestAnimationFrame(worldTick)
	controlLoop()

window.updateVars = updateVars
