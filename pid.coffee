# Proportional Gain Coefficient
proportionalGain = .2

# Integral Gain Coefficient
integralGain = .15

# Derivative Gain Coefficient
derivativeGain = .03

# Control loop frequency in Hz
freq = 15

ctx = {}
cnvs = {}

setpoint = {'x':0, 'y':0}
mouse = {'x':0, 'y':0}
ball_position = {'x':0, 'y': 0}
ball_velocity = {'x':0, 'y':0}
error = {'x':0, 'y':0}
lastError = {'x':0, 'y':0}
sumError = {'x':0, 'y':0}
pastErrors = []

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

getFreq = ->
	freq

controlLoop = ->
	setpoint = getMouse()
	for dim in ['x','y']
		error[dim] = setpoint[dim] - ball_position[dim]
		velocity = proportionalGain * error[dim]
		sumError[dim] += error[dim]
		velocity += integralGain * sumError[dim]
		errorSlope = error[dim] - lastError[dim]
		velocity += derivativeGain * errorSlope
		ball_velocity[dim] = velocity
		lastError[dim] = error[dim]
	pastErrors.unshift(copy_2vector(error))
	if pastErrors.length > cnvs.width
		pastErrors.pop()
	setTimeout(controlLoop, 1000/freq)

copy_2vector = (v) ->
	{ 'x': v.x, 'y': v.y }

worldTick = ->
	ball_position.x += ball_velocity.x
	ball_position.y += ball_velocity.y

	#keep ball in bounds
	if ball_position.y > cnvs.height
		ball_position.y = cnvs.height
	if ball_position.x > cnvs.width
		ball_position.x = cnvs.width
	if ball_position.x < 0
		ball_position.x = 0
	if ball_position.y < 0
		ball_position.y = 0
	draw()
	window.requestAnimationFrame(worldTick)

draw = ->
	ctx.clearRect(0,0,cnvs.width,cnvs.height)

	ctx.font = "16px sans-serif"

	#draw y error graph
	ctx.strokeStyle = 'green'
	ctx.fillStyle = 'green'
	ctx.fillText("Time →", 10, 26)
	ctx.beginPath()
	ctx.moveTo(0,cnvs.height/2)
	offset = 0
	for e in pastErrors
		ctx.lineTo(offset,(cnvs.height/2) + e.y,1,1);
		offset += 1
	ctx.stroke()

	#draw x error graph
	ctx.strokeStyle = 'orange'
	ctx.fillStyle = 'orange'
	ctx.fillText("Time ↓", 10, 46)
	ctx.beginPath()
	ctx.moveTo(cnvs.width/2,0)
	offset = 0
	for e in pastErrors
		ctx.lineTo((cnvs.width/2) + e.x,offset,1,1);
		offset += 1
	ctx.stroke()

	#draw ball
	ctx.beginPath()
	ctx.arc(ball_position.x,ball_position.y,20,0,Math.PI*2,yes)
	ctx.closePath()
	ctx.strokeStyle = 'black'
	ctx.fillStyle = 'red'
	ctx.fill()
	ctx.stroke()

	#draw loop setpoint
	#ctx.beginPath()
	#ctx.arc(setpoint.x,setpoint.y,5,0,Math.PI*2,yes)
	#ctx.closePath()
	#ctx.strokeStyle = 'black'
	#ctx.fillStyle = 'blue'
	#ctx.fill()
	#ctx.stroke()

	#draw actual error
	#ctx.beginPath()
	#ctx.moveTo(mouse.x,mouse.y)
	#ctx.lineTo(ball_position.x,ball_position.y)
	#ctx.strokeStyle = 'violet'
	#ctx.stroke()
	
	#draw loop error
	#ctx.beginPath()
	#ctx.moveTo(setpoint.x,setpoint.y)
	#ctx.lineTo(ball_position.x,ball_position.y)
	#ctx.strokeStyle = 'green'
	#ctx.stroke()

	#draw ball velocity
	#ctx.beginPath()
	#ctx.moveTo(ball_position.x,ball_position.y)
	#ctx.lineTo(ball_position.x + (ball_velocity.x ),ball_position.y + (ball_velocity.y ))
	#ctx.strokeStyle = 'black'
	#ctx.stroke()

updateVars = (e) ->
	if(e)
		e.preventDefault()
	if window.controls.checkValidity()
		proportionalGain = window.pbox.value
		integralGain = window.ibox.value
		derivativeGain = window.dbox.value
		freq = window.fbox.value
		setpoint = {'x':0, 'y':0}
		mouse = {'x':0, 'y':0}
		ball_position = {'x':0, 'y': 0}
		ball_velocity = {'x':0, 'y':0}
		error = {'x':0, 'y':0}
		lastError = {'x':0, 'y':0}
		sumError = {'x':0, 'y':0}
		pastErrors = []

winch = ->
	cnvs.width = window.innerWidth
	cnvs.height = 500
	updateVars(false)

window.onload = ->
	window.pbox = document.getElementById('pbox')
	window.ibox = document.getElementById('ibox')
	window.dbox = document.getElementById('dbox')
	window.fbox = document.getElementById('fbox')
	window.submit = document.getElementById('submit')
	window.controls = document.getElementById('controls')
	window.pbox.value = proportionalGain
	window.ibox.value = integralGain
	window.dbox.value = derivativeGain
	window.fbox.value = freq
	cnvs = document.getElementById('cnvs')
	ball_position.x = cnvs.width/2
	ball_position.y = cnvs.height/2
	ctx = cnvs.getContext('2d')
	cnvs.addEventListener('mousemove', (e) -> updateMouse(e))
	window.controls.addEventListener("submit", (e) -> updateVars(e));
	window.addEventListener('resize', winch)
	winch()
	window.requestAnimationFrame(worldTick)
	controlLoop()

window.updateVars = updateVars
