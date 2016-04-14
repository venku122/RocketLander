// main.js
// Dependencies:
// Description: singleton object
// This object will be our main "controller" class and will contain references
// to most of the other objects in the game.

"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

/*
 .main is an object literal that is a property of the app global
 This object literal has its own properties and methods (functions)

 */
 app.main = {


	 //Game State Machine
	GAME_STATE: Object.freeze({
		START: 0,
		DEFAULT: 1,
		LANDED: 2,
		DESTROYED: 3,
		INSTRUCTIONS: 4,
    SPLASH: 5,
    CREDITS: 6
	}),
	GAME_MODE: {
		MOUNTAIN: 0,
		SEA: 1,
		DESSERT: 2
	},

	 //Properties
	canvas: undefined,
    ctx: undefined,
	uicanvas: undefined,
	uictx: undefined,
	debug: false,
    timer: 0,
	animationID: 0,
	HEIGHT: 500,
	WIDTH: 500,
	lastTime:0, //Used by calculateDeltaTime()
	grd: undefined,
	mountainPeaks: [],
	state: null,
	mode: null,
	mountainIndex: 5,
	landDifferential: 2,
	clearHeight: 0,
	time: 0,
	target: {},
	BUTTON_GRAPHICS: {
		MOUNTAIN: new Image(),
		SEA: new Image(),
		SEA_X: 0,
		SEA_Y: 0,
		MOUNTAIN_X: 0,
		MOUNTAIN_Y: 0,
	},
	maxLandingVelocity: 25,
	PAUSED: false,

  //scoring attributes
  score: 0,
  closeBonus: 5000,
  fuelBonus: 2000,
  speedBonus: 50,

	init : function(){
		if(this.debug) console.log("app.main.init() called");

		// initialize properties
		this.canvas = Draw.canvas;
		this.WIDTH = Draw.canvas.width;
		this.HEIGHT = Draw.canvas.height;
		this.ctx = this.canvas.getContext('2d');

		this.uicanvas = document.getElementById('uiCanvas');
		this.uictx = this.uicanvas.getContext('2d');

		//this.state = this.GAME_STATE.START; //Enable while testing
		this.state = this.GAME_STATE.SPLASH;


		//set gradient
		this.grd = this.ctx.createLinearGradient(135,206,250, this.HEIGHT),
		this.grd.addColorStop(1, "skyblue"),
		this.grd.addColorStop(0, "white"),
		app.rocket.Emitter = app.Emitter;


		//Set up external buttons
		var pauseButton = document.getElementById("pauseResumeButton");
		pauseButton.onclick = function(e){
			if(app.main.PAUSED) {
				app.main.PAUSED = false;
				e.target.textContent = "Pause"
			} else {
				app.main.PAUSED = true;
				e.target.textContent = "Un-Pause"
			}
		}
		var aiButton = document.getElementById("autoPilot");
		aiButton.onclick = function(e){
			if(app.rocket.autopilot) {
				app.rocket.autopilot = false;
				e.target.textContent = "Engage Auto Pilot"
			} else {
				app.rocket.autopilot = true;
				e.target.textContent = "Disable Auto Pilot"
			}
		}

		this.update();
	},

	imageLoader : function(images) {
		var main = app.main;
		main.BUTTON_GRAPHICS.SEA.src = images.sea.src;
		main.BUTTON_GRAPHICS.MOUNTAIN.src = images.mountain.src;

		main.BUTTON_GRAPHICS.SEA.crossOrigin = "anonymous";
		main.BUTTON_GRAPHICS.SEA.crossOrigin = "anonymous";

		main.BUTTON_GRAPHICS.SEA_X = main.WIDTH/3 - 50;
		main.BUTTON_GRAPHICS.SEA_Y = main.HEIGHT / 3 * 2;
		main.BUTTON_GRAPHICS.MOUNTAIN_X = main.BUTTON_GRAPHICS.SEA_X + main.BUTTON_GRAPHICS.SEA.width + 50;
		main.BUTTON_GRAPHICS.MOUNTAIN_Y = main.BUTTON_GRAPHICS.SEA_Y;

	},

	update : function(){
		// 1) LOOP
		// schedule a call to update()
	 	//requestAnimationFrame(function(){app.main.update()});
		//requestAnimationFrame(function(){this.update();});
		//requestAnimationFrame(this.update.bind(this));
		this.animationID = requestAnimationFrame(this.update.bind(this));

    var dt = this.calculateDeltaTime();
    this.time += dt;

		if(myKeys.keydown[myKeys.KEYBOARD.KEY_U]){
			this.debug=!this.debug;
			app.rocket.debug = this.debug;
		}

		switch(this.state){

			case this.GAME_STATE.SPLASH:
			this.drawBG();
			app.rocket.drawSplash(this.ctx, dt);
			this.drawUI();
      this.drawTimer(this.ctx, this.timer, 5);
			this.timer+= dt;
      if(app.audioHandler.Sounds.FLIGHT.buffer != undefined && app.audioHandler.Sounds.FLIGHT.nodes.length == 0) app.audioHandler.playLoop(app.audioHandler.Sounds.FLIGHT, 6);
			if(this.timer>= 5 || Object.keys(myKeys.keydown).length != 0) this.state = this.GAME_STATE.START;
			break;

			case this.GAME_STATE.START:
			this.drawBG();
			this.drawUI();
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_M]) {
				this.mode = this.GAME_MODE.MOUNTAIN;
				this.generatePeaks(this.HEIGHT - 100);
				this.state = this.GAME_STATE.DEFAULT;
				app.audioHandler.stopSound(app.audioHandler.SOUNDS.FLIGHT);
			}
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_S]) {
				this.mode = this.GAME_MODE.SEA;
				this.generatePeaks(this.HEIGHT  - 100);
				this.state = this.GAME_STATE.DEFAULT;
				app.audioHandler.stopSound(app.audioHandler.SOUNDS.FLIGHT);
			}
			break;

      case this.GAME_STATE.INSTRUCTIONS:
        this.drawBG();
        this.drawUI();
        if(myKeys.keydown[myKeys.KEYBOARD.KEY_SPACE]) {
          this.state = this.GAME_STATE.START;
        }
      break;

      case this.GAME_STATE.CREDITS:
        this.drawBG();
        this.drawUI();
        if(myKeys.keydown[myKeys.KEYBOARD.KEY_SPACE]) {
          this.state = this.GAME_STATE.START;
        }
      break;

			case this.GAME_STATE.DEFAULT:
      if(app.audioHandler.Sounds.FLIGHT.nodes.length!=0) app.audioHandler.stopSound(app.audioHandler.Sounds.FLIGHT);
			if(this.PAUSED == false) {
				//get deltaTime
				//collect input
				//change gimbal position
				if(myKeys.keydown[myKeys.KEYBOARD.KEY_A]) app.rocket.changeGimbal(-15, dt);
				if(!app.rocket.autopilot) if(myKeys.keydown[myKeys.KEYBOARD.KEY_D]) app.rocket.changeGimbal(15, dt);
				if(!app.rocket.autopilot) if(!myKeys.keydown[myKeys.KEYBOARD.KEY_D] && !myKeys.keydown[myKeys.KEYBOARD.KEY_A]) app.rocket.changeGimbal(0, dt);

				//check for throttle
				if(myKeys.keydown[myKeys.KEYBOARD.KEY_W]) app.rocket.throttleOn(dt);
				if(!myKeys.keydown[myKeys.KEYBOARD.KEY_W]) app.rocket.throttleOff(dt);

        //check for triple engines
        if(myKeys.keydown[myKeys.KEYBOARD.KEY_SHIFT]) app.rocket.tripleOn(dt);
				if(!myKeys.keydown[myKeys.KEYBOARD.KEY_SHIFT]) app.rocket.tripleOff(dt);

				// TODO: Make a different control scheme or toggle for this as it breaks AI controls

				if(app.rocket.autopilot == true) {
					if(this.target.x > app.rocket.position.x + 20) {
						app.rocket.changeGimbal(-5, dt);
					} else if(this.target.x < app.rocket.position.x - 20) {
						app.rocket.changeGimbal(5, dt);
					} else {
						app.rocket.changeGimbal(0, dt);
					}
					if(app.rocket.velocity.length() > this.maxLandingVelocity - 5) {
						app.rocket.throttleOn();
					} else {
						app.rocket.throttleOff();
					}
				}

				//update
				app.rocket.update(dt);
			}
			if(this.state == this.GAME_STATE.DEFAULT){
				if(this.checkForCollisions(app.rocket) || this.shakeTimer != null) {
					if(!this.didLandSafely(app.rocket) || this.shakeTimer != null){
						shake(.005, 1);
						if(this.mode != this.GAME_MODE.SEA)
						{
							app.rocket.velocity.y = 0;
						} else {

						}
						app.rocket.velocity.x = 0;
						if(this.shakeTimer == null) {
							this.shakeTimer = 1;
						} else {
							this.shakeTimer -= dt;
						}
						if(this.shakeTimer < 0) {
              if(app.audioHandler.Sounds.ENGINE.nodes.length!=0) app.audioHandler.stopSound(app.audioHandler.Sounds.ENGINE);
							this.state = this.GAME_STATE.DESTROYED;
						}
					}
					else{
            if(app.audioHandler.Sounds.ENGINE.nodes.length!=0) app.audioHandler.stopSound(app.audioHandler.Sounds.ENGINE);
						this.state = this.GAME_STATE.LANDED;
					}
				}
			}

			//debugger;
			// 5) DRAW
			this.drawBG();
			this.drawUI();
			this.drawTerrain();
			this.drawWaypoint();
			this.drawSupportUI();

			//draw rocket
			app.rocket.draw(this.ctx);

			if(this.debug) console.log("Delta time: "+ dt);

			break;

			case this.GAME_STATE.LANDED:
				this.drawBG();
				this.drawUI();
				if(myKeys.keydown[myKeys.KEYBOARD.KEY_SPACE])
				{
					app.rocket.reset();
					this.shakeTimer = null;
					this.state = this.GAME_STATE.DEFAULT;
				}
			break;

			case this.GAME_STATE.DESTROYED:
				this.drawBG();
				this.drawUI();
				if(myKeys.keydown[myKeys.KEYBOARD.KEY_SPACE])
				{
					app.rocket.reset();
					this.shakeTimer = null;
					this.state = this.GAME_STATE.DEFAULT
				}
			break;
		}

		render();
	},

	generatePeaks: function(startY){
		this.mountainPeaks = new Array(this.width);
		var y = startY;

		if(this.mode == this.GAME_MODE.SEA) {
			y = this.HEIGHT / 10 * 9;
			for (var x = 0; x < this.WIDTH; x += this.mountainIndex) {
				var noise = perlin(x, 50);
				this.mountainPeaks[x] = y;
				//y += (noise * 5 * (Math.random() > .5 ? 1 : -1));
			}
		} else {
			for (var x = 0; x < this.WIDTH; x += this.mountainIndex) {
				var noise = perlin(x, 50);
				this.mountainPeaks[x] = y;
				y += (noise * 5 * (Math.random() > .5 ? 1 : -1));
			}
		}

		if(this.mode == this.GAME_MODE.MOUNTAIN) {
			var min = 15;
			var range = 20;
			var rand = map_range(Math.random(), 0, 1, min, min + range);
			rand = Math.round(rand);
			var startIndex = map_range(Math.random(), 0, 1, 0, (this.WIDTH / (this.mountainIndex )) - min - range);
			startIndex = Math.floor(startIndex);
			this.clearHeight = this.mountainPeaks[startIndex - startIndex % 5];
			for(x = startIndex * this.mountainIndex; x < startIndex * this.mountainIndex + (rand * this.mountainIndex); x += this.mountainIndex) {
				this.mountainPeaks[x] = this.clearHeight;
			}
			this.target.x = startIndex * this.mountainIndex + (rand * this.mountainIndex / 2);
			this.target.y = this.clearHeight;
		} else if(this.mode == this.GAME_MODE.SEA) {
			var rand = map_range(Math.random(), 0, 1, this.WIDTH / 5, this.WIDTH / 5 * 4);
			this.target.x = rand - rand % this.mountainIndex;
			this.target.y = y;
		}
	},

	calculateDeltaTime: function(){
		// what's with (+ new Date) below?
		// + calls Date.valueOf(), which converts it from an object to a
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date);
		fps = 1000 / (now - this.lastTime);
		fps = clamp(fps, 12, 60);
		this.lastTime = now;
		return 1/fps;
	},

	didLandSafely: function(rocket) {
		var closestPeakIndex = Math.floor(rocket.position.x);
		closestPeakIndex -= closestPeakIndex % this.mountainIndex;
		if(Math.abs(rocket.position.y - this.mountainPeaks[closestPeakIndex] - rocket.height) > this.landDifferential
			&& Math.abs(rocket.position.x - this.target.x) < 50 ) {
			if(rocket.velocity.length() >= this.maxLandingVelocity){
				return false;
			}
      debugger;
      this.score = (this.closeBonus / (rocket.position.x - this.target.x) ) //points for getting close to the center
      + (rocket.fuel * this.fuelBonus) //points for having fuel remaining
       - (rocket.velocity.y * this.speedBonus); //points taken away for landing fast
			return true;
		}
	},

	checkForCollisions: function(rocket) {
		for(var i = 0; i < 3; i ++) {
			var index = Math.floor(rocket.position.x) - (Math.floor(rocket.position.x + 5 * i) % 5)
			if(Math.abs(rocket.position.y + rocket.height - this.mountainPeaks[index]) < this.landDifferential ||rocket.position.y + rocket.height > this.mountainPeaks[index]) {
				return true;
			}
      if(rocket.position.x> app.main.WIDTH + 200 ||
         rocket.position.y> app.main.HEIGHT + 100 ||
          rocket.position.x< -200 ||
           rocket.position.y< -200) {
             return true;
           }
		}
		return false;

	},

	drawUI: function(){

		switch(this.state){

      case this.GAME_STATE.SPLASH:
      //draw menu text
      this.ctx.font = "35px 'Press Start 2P'";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Rocket Lander", this.WIDTH/2,this.HEIGHT/6 );

      break;

			case this.GAME_STATE.START:
				//draw menu text
				this.ctx.font = "35px 'Press Start 2P'";
				this.ctx.textAlign = "center";
				this.ctx.fillText("Rocket Lander", this.WIDTH/2,this.HEIGHT/6 );
        this.ctx.fillText("Instructions", this.WIDTH/2, this.HEIGHT / 6 + 100);
        this.ctx.fillText("Credits", this.WIDTH/2, this.HEIGHT / 6 + 200);
        this.ctx.fillText("Click Below", this.WIDTH/2, this.HEIGHT / 6 + 400);
				this.ctx.fillText("Ocean", 375, this.HEIGHT-375);
				this.ctx.fillText("Mars", 375 + 250, this.HEIGHT-375);
				this.drawButtons();
				break;

			case this.GAME_STATE.DEFAULT:
				if(this.debug){
					this.ctx.font=" 20px monospace";
					this.ctx.textAlign = "center";
					this.ctx.fillText("Position: " + app.rocket.position, this.WIDTH/2,this.HEIGHT/3 );
					this.ctx.fillText("Velocity: " + app.rocket.velocity, this.WIDTH/2,this.HEIGHT/2 );
					this.ctx.fillText("Acceleration " + app.rocket.acceleration, this.WIDTH/2,this.HEIGHT/1.5 - 50);
					this.ctx.fillText("Gimbal Position: " + app.rocket.currentGimbal, this.WIDTH/2,this.HEIGHT/1.5);
				}
			break;
			case this.GAME_STATE.LANDED:
				//draw menu text
				this.ctx.font="20px 'Press Start 2P'";
				this.ctx.textAlign = "center";
				this.ctx.fillText("The rocket has landed!", this.WIDTH/2,this.HEIGHT/3 );
        this.ctx.fillText("Your score was: " + Math.round(this.score), this.WIDTH/2,this.HEIGHT/3 + 50 );
				this.ctx.fillText("Press space to restart", this.WIDTH/2,this.HEIGHT/3 + 150 );
			break;
			case this.GAME_STATE.DESTROYED:
				//draw menu text
				this.ctx.font="20px 'Press Start 2P'";
				this.ctx.textAlign = "center";
				this.ctx.fillText("You were destroyed", this.WIDTH/2,this.HEIGHT/3 );
				this.ctx.fillText("Press space to restart", this.WIDTH/2,this.HEIGHT/3 + 50 );
			break;

      case this.GAME_STATE.CREDITS:
				//draw menu text
				this.ctx.font="30px 'Press Start 2P'";
				this.ctx.textAlign = "center";
				this.ctx.fillText("Developed by: ", this.WIDTH/2,this.HEIGHT/3 );
				this.ctx.fillText("T.J. Tarazevits", this.WIDTH/2,this.HEIGHT/3 + 50 );
        this.ctx.fillText("Aidan McInerny", this.WIDTH/2,this.HEIGHT/3 + 100 );
        this.ctx.fillText("Press space to return", this.WIDTH/2,this.HEIGHT/3 + 150 );
			break;

      case this.GAME_STATE.INSTRUCTIONS:
				//draw menu text
				this.ctx.font="30px 'Press Start 2P'";
				this.ctx.textAlign = "center";
				this.ctx.fillText("Use 'W' to thrust!", this.WIDTH/2,this.HEIGHT/3 );
				this.ctx.fillText("Press 'A' and 'D' to gimbal", this.WIDTH/2,this.HEIGHT/3 + 50 );
        this.ctx.fillText("Press 'Shift' to use 3 engines!", this.WIDTH/2,this.HEIGHT/3 + 100 );
        this.ctx.fillText("Press space to return", this.WIDTH/2,this.HEIGHT/3 + 150 );
			break;
		}
	},

	drawBG: function(){
		// i) draw background
		this.ctx.save();
		this.ctx.fillStyle = this.grd;
		this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
		this.ctx.restore();
	},

	drawTerrain: function(){
		this.ctx.save();
		this.ctx.beginPath();
		if(this.mode == this.GAME_MODE.MOUNTAIN) {
			this.ctx.moveTo(0, this.HEIGHT);
			this.ctx.lineTo(0, this.mountainPeaks[0]);
		} else if (this.mode == this.GAME_MODE.SEA) {
			this.ctx.moveTo(0, this.HEIGHT);
			this.ctx.lineTo(0, this.mountainPeaks[0] + 2 * Math.sin(this.time));
			this.mountainPeaks[this.mountainPeaks.length - 1] = this.target.y + 4 * Math.sin(this.time);
		} else {
			this.ctx.moveTo(0, this.mountainPeaks[0]);
		}
		for (var x = 0; x < this.WIDTH; x+= this.mountainIndex) {
			var noise = perlin(x, 50);
			if(this.mode == this.GAME_MODE.SEA) {
				x + this.mountainIndex < this.mountainPeaks.length
				? this.ctx.quadraticCurveTo(x, this.mountainPeaks[x] ,x + this.mountainIndex, this.mountainPeaks[x + this.mountainIndex] )
				: this.ctx.quadraticCurveTo(x, this.mountainPeaks[x] ,x + this.mountainIndex, this.mountainPeaks[x] )
				this.mountainPeaks[x] = this.mountainPeaks[x + this.mountainIndex];
			} else {
				this.ctx.lineTo(x, this.mountainPeaks[x]);
			}
		}
		if(this.mode == this.GAME_MODE.MOUNTAIN) {
			this.ctx.lineTo(this.WIDTH, this.HEIGHT);
			this.ctx.fillStyle = "brown";
			this.ctx.fill();
		} else if (this.mode == this.GAME_MODE.SEA) {
			this.ctx.lineTo(this.WIDTH, this.HEIGHT);
			this.ctx.fillStyle = "lightblue";
			this.ctx.fill();
		}
		this.ctx.closePath();
		this.ctx.strokeStyle = "black";
		this.ctx.stroke();

		this.ctx.restore();
	},

	drawWaypoint: function() {
		this.ctx.save();
		this.ctx.beginPath();
		if(this.mode == this.GAME_MODE.MOUNTAIN) {
			this.ctx.moveTo(this.target.x - 20 - 10 * Math.sin(this.time), this.target.y);
			this.ctx.lineTo(this.target.x, this.target.y);
			this.ctx.lineTo(this.target.x, this.target.y - 20 - 10 * Math.sin(this.time));
			this.ctx.lineTo(this.target.x, this.target.y);
			this.ctx.lineTo(this.target.x + 20 + 10 * Math.sin(this.time), this.target.y);
		} else if(this.mode == this.GAME_MODE.SEA) {
			this.ctx.moveTo(this.target.x - 20 - 10 * Math.sin(this.time), this.mountainPeaks[this.target.x - 20] - 1);
			this.ctx.lineTo(this.target.x, this.mountainPeaks[this.target.x] - 1);
			this.ctx.lineTo(this.target.x, this.mountainPeaks[this.target.x - 20] - 20 * Math.abs(Math.sin(this.time)) - 10 - 1);
			this.ctx.lineTo(this.target.x, this.mountainPeaks[this.target.x] - 1);
			this.ctx.lineTo(this.target.x + 20 + 10 * Math.sin(this.time), this.mountainPeaks[this.target.x + 20] - 1);
		}
		this.ctx.closePath();
		this.ctx.strokeStyle = "yellow";
		this.ctx.stroke();

		if(this.mode == this.GAME_MODE.SEA) {
			this.ctx.beginPath();
			var size = 8 * this.mountainIndex;
			this.ctx.moveTo(this.target.x - size, this.mountainPeaks[this.target.x - size] + 10);
			this.ctx.lineTo(this.target.x - size, this.mountainPeaks[this.target.x - size]);

			this.ctx.lineTo(this.target.x + size, this.mountainPeaks[this.target.x + size]);
			this.ctx.lineTo(this.target.x + size, this.mountainPeaks[this.target.x + size] + 10);

			this.ctx.lineTo(this.target.x - size, this.mountainPeaks[this.target.x - size] + 10);

			this.ctx.strokeStyle = "black";
			this.ctx.closePath();
			this.ctx.stroke();
			this.ctx.fillStyle = "gray";
			this.ctx.fill();
		}

		this.ctx.restore();
	},

	drawSupportUI: function() {
		this.uictx.clearRect(0,0,this.uicanvas.width, this.uicanvas.height);
		this.uictx.textAlign = "center";
		this.uictx.font=" 20px monospace";
		switch(this.state){
			case this.GAME_STATE.DEFAULT:
			//Create the UI that will represent the in game status of the ship, such as if it is okay to land
			this.uictx.save();
			//Draw somethign to indicate ship status information
			this.statusBox = {
				X: 400,
				Y: 0,
				height: 170
			}
			this.uictx.strokeStyle = "black";
			this.uictx.strokeRect(this.statusBox.X, this.statusBox.Y, 112, this.statusBox.height);
			this.uictx.save();
			this.uictx.font=" 18px monospace";
			this.uictx.fillStyle = "white";
			this.uictx.fillText("Ship status", this.statusBox.X + 57, this.statusBox.Y + 18);
			this.uictx.beginPath();
			this.uictx.moveTo(this.statusBox.X, this.statusBox.Y + 25);
			this.uictx.lineTo(this.statusBox.X + 200, this.statusBox.Y + 25);
			this.uictx.strokeStyle = "black";
			this.uictx.stroke();
			this.uictx.restore();
			//Landing Indicator -------------------------------------------------
			this.landingIndicator = {
				X: 500,
				Y: 40,
				radius: 5,
			}
			this.uictx.beginPath();
			this.uictx.arc(this.landingIndicator.X, this.landingIndicator.Y, this.landingIndicator.radius, 0, 2 * Math.PI);
			if(app.rocket.velocity.length() < this.maxLandingVelocity ){
				this.uictx.fillStyle = "green";
			}
			else{
				this.uictx.fillStyle = "red";
			}
			this.uictx.fill();
			this.uictx.save();
			this.uictx.font=" 11px monospace";
			this.uictx.fillStyle = "white";
			this.uictx.fillText("Landing Speed?", this.landingIndicator.X - 50, this.landingIndicator.Y  + 3);
			this.uictx.restore();

			// Hull indicator, turns red when crashing
			this.uictx.beginPath();
			this.uictx.arc(this.landingIndicator.X, this.landingIndicator.Y + 40, this.landingIndicator.radius, 0, 2 * Math.PI);
			if(this.shakeTimer == null ){
				this.uictx.fillStyle = "green";
			}
			else{
				this.uictx.fillStyle = "red";
			}
			this.uictx.fill();
			this.uictx.save();
			this.uictx.font=" 11px monospace";
			this.uictx.fillStyle = "white";
			this.uictx.fillText("Hull:", this.landingIndicator.X - 50, this.landingIndicator.Y  + 43);
			this.uictx.restore();

			// Running:
			this.uictx.beginPath();
			this.uictx.arc(this.landingIndicator.X, this.landingIndicator.Y + 60, this.landingIndicator.radius, 0, 2 * Math.PI);
			if(this.PAUSED == false ){
				this.uictx.fillStyle = "green";
			}
			else{
				this.uictx.fillStyle = "red";
			}
			this.uictx.fill();
			this.uictx.save();
			this.uictx.font=" 11px monospace";
			this.uictx.fillStyle = "white";
			this.uictx.fillText("Running:", this.landingIndicator.X - 50, this.landingIndicator.Y  + 63);
			this.uictx.restore();

			// Thrusters:
			this.uictx.beginPath();
			this.uictx.arc(this.landingIndicator.X, this.landingIndicator.Y + 80, this.landingIndicator.radius, 0, 2 * Math.PI);
			if(app.rocket.isThrottle  ){
				this.uictx.fillStyle = "green";
			}
			else{
				this.uictx.fillStyle = "red";
			}
			this.uictx.fill();
			this.uictx.save();
			this.uictx.font=" 11px monospace";
			this.uictx.fillStyle = "white";
			this.uictx.fillText("Thrusters On?", this.landingIndicator.X - 50, this.landingIndicator.Y  + 83);
			this.uictx.restore();

			// Autopilot:
			this.uictx.beginPath();
			this.uictx.arc(this.landingIndicator.X, this.landingIndicator.Y + 100, this.landingIndicator.radius, 0, 2 * Math.PI);
			if(app.rocket.autopilot  ){
				this.uictx.fillStyle = "green";
			}
			else{
				this.uictx.fillStyle = "red";
			}
			this.uictx.fill();
			this.uictx.save();
			this.uictx.font=" 11px monospace";
			this.uictx.fillStyle = "white";
			this.uictx.fillText("Autopilot:", this.landingIndicator.X - 50, this.landingIndicator.Y  + 103);
			this.uictx.restore();

			// Offradar:
			this.uictx.beginPath();
			this.uictx.arc(this.landingIndicator.X, this.landingIndicator.Y + 120, this.landingIndicator.radius, 0, 2 * Math.PI);
			if(app.rocket.position.x < 0 || app.rocket.position.x > this.WIDTH ){
				this.uictx.fillStyle = "red";
			}
			else{
				this.uictx.fillStyle = "green";
			}
			this.uictx.fill();
			this.uictx.save();
			this.uictx.font=" 11px monospace";
			this.uictx.fillStyle = "white";
			this.uictx.fillText("In Radar:", this.landingIndicator.X - 50, this.landingIndicator.Y  + 123);
			this.uictx.restore();

			//-------------------------------------------------------------------
			//Fuel Indicator ----------------------------------------------------
			//Create a gradient that will map the ammount of fuel to how much has been used
			this.fuelIndicator = {
				X:100,
				Y:100,
				radius: 100,
				fuelBound: 1,
			}
			var fuelPercentage = app.rocket.fuelPercentage;
			if(fuelPercentage < 0) {
				fuelPercentage = 0;
			}

			this.uictx.beginPath();
			this.uictx.moveTo(this.fuelIndicator.X ,
							this.fuelIndicator.Y );
			var targetRadian = map_range(fuelPercentage,
											0, this.fuelIndicator.fuelBound,
											0, Math.PI);
			var dialX = this.fuelIndicator.X - this.fuelIndicator.radius * Math.cos(targetRadian);
			var dialY = this.fuelIndicator.Y - this.fuelIndicator.radius * Math.sin(targetRadian);
			this.uictx.lineTo(dialX, dialY);
			this.uictx.strokeStyle = "black";
			this.uictx.stroke();

			this.uictx.beginPath();
			this.uictx.moveTo(this.fuelIndicator.X ,
							this.fuelIndicator.Y );
			targetRadian = map_range(.1,
										0, this.fuelIndicator.fuelBound,
										0, Math.PI);
			dialX = this.fuelIndicator.X - this.fuelIndicator.radius * Math.cos(targetRadian);
			dialY = this.fuelIndicator.Y - this.fuelIndicator.radius * Math.sin(targetRadian);
			this.uictx.lineTo(dialX, dialY);
			this.uictx.strokeStyle = "red";
			this.uictx.stroke();

			this.uictx.beginPath();
			this.uictx.arc(this.fuelIndicator.X, this.fuelIndicator.Y, this.fuelIndicator.radius, Math.PI, 2*Math.PI);
			this.uictx.closePath();
			this.uictx.strokeStyle = "black";
			this.uictx.stroke();

			this.uictx.fillStyle = "white";
			this.uictx.fillText("" + Math.round(fuelPercentage * 100), this.fuelIndicator.X, this.fuelIndicator.Y - this.fuelIndicator.radius / 2);
			this.uictx.fillText("Fuel", this.fuelIndicator.X, this.fuelIndicator.Y + 20);

			//Draw ship status for fuel indicator
			this.uictx.beginPath();
			this.uictx.arc(this.landingIndicator.X, this.landingIndicator.Y + 20, this.landingIndicator.radius, 0, 2 * Math.PI);
			if(fuelPercentage > .1 ){
				this.uictx.fillStyle = "green";
			}
			else{
				this.uictx.fillStyle = "red";
			}
			this.uictx.fill();
			this.uictx.save();
			this.uictx.font=" 11px monospace";
			this.uictx.fillStyle = "white";
			this.uictx.fillText("Fuel:", this.landingIndicator.X - 50, this.landingIndicator.Y  + 23);
			this.uictx.restore();

			//-----------------------------------------------------------------------
			//Velocity Indicator ----------------------------------------------------
			//Draw a semi circle
			//draw a dial for current velocity
			//Draw a dial for target velocity
			this.velocityIndicator = {
				X: 300,
				Y: 100,
				radius: 100,
				speedBound: 100
			}

			this.uictx.beginPath();
			this.uictx.moveTo(this.velocityIndicator.X ,
							this.velocityIndicator.Y );
			var targetRadian = map_range(app.rocket.velocity.length(),
											0, this.velocityIndicator.speedBound,
											0, Math.PI);
			targetRadian = clamp(targetRadian, 0, Math.PI);
			var dialX = this.velocityIndicator.X - this.velocityIndicator.radius * Math.cos(targetRadian);
			var dialY = this.velocityIndicator.Y - this.velocityIndicator.radius * Math.sin(targetRadian);
			this.uictx.lineTo(dialX, dialY);
			this.uictx.strokeStyle = "black";
			this.uictx.stroke();

			this.uictx.beginPath();
			this.uictx.moveTo(this.velocityIndicator.X ,
							this.velocityIndicator.Y );
			targetRadian = map_range(this.maxLandingVelocity,
											0, this.velocityIndicator.speedBound,
											0, Math.PI);
			dialX = this.velocityIndicator.X - this.velocityIndicator.radius * Math.cos(targetRadian);
			dialY = this.velocityIndicator.Y - this.velocityIndicator.radius * Math.sin(targetRadian);
			this.uictx.lineTo(dialX, dialY);
			this.uictx.strokeStyle = "yellow";
			this.uictx.stroke();

			this.uictx.beginPath();
			this.uictx.arc(this.velocityIndicator.X, this.velocityIndicator.Y, this.velocityIndicator.radius, Math.PI, 2*Math.PI);
			this.uictx.closePath();
			this.uictx.strokeStyle = "black";
			this.uictx.stroke();

			this.uictx.fillStyle = "white";
			this.uictx.fillText("" + Math.round(app.rocket.velocity.length()), this.velocityIndicator.X, this.velocityIndicator.Y - this.velocityIndicator.radius / 2);
			this.uictx.fillText("Speed", this.velocityIndicator.X, this.velocityIndicator.Y + 20);
			//-------------------------------------------------------------------

			this.uictx.restore();

			break;

			default:
			break;
		}

	},

	drawButtons: function() {
		var seaX, seaY;
		seaX = 35;
		seaY = this.HEIGHT / 3 * 2;
		this.ctx.drawImage(this.BUTTON_GRAPHICS.SEA, this.BUTTON_GRAPHICS.SEA_X, this.BUTTON_GRAPHICS.SEA_Y, this.BUTTON_GRAPHICS.SEA.width, this.BUTTON_GRAPHICS.SEA.height);
		this.ctx.strokeRect(this.BUTTON_GRAPHICS.SEA_X, this.BUTTON_GRAPHICS.SEA_Y, this.BUTTON_GRAPHICS.SEA.width, this.BUTTON_GRAPHICS.SEA.height )

		this.ctx.drawImage(this.BUTTON_GRAPHICS.MOUNTAIN, this.BUTTON_GRAPHICS.MOUNTAIN_X, this.BUTTON_GRAPHICS.MOUNTAIN_Y, this.BUTTON_GRAPHICS.MOUNTAIN.width, this.BUTTON_GRAPHICS.MOUNTAIN.height);
		this.ctx.strokeRect(this.BUTTON_GRAPHICS.MOUNTAIN_X, this.BUTTON_GRAPHICS.MOUNTAIN_Y, this.BUTTON_GRAPHICS.MOUNTAIN.width, this.BUTTON_GRAPHICS.MOUNTAIN.height )
	},

  drawTimer: function(ctx, currentTime, goal) {
    //debugger;
      ctx.save();
      ctx.fillStyle = "red";
      ctx.fillRect(20, this.HEIGHT/3, (this.WIDTH - 20) * (currentTime / goal), 20);
      ctx.restore();
  },

	doMouseDown: function(e) {
		var mouse = getMouse(e);
    this.ctx.font = "35px 'Press Start 2P'";
    debugger;
		switch(this.state) {
			case this.GAME_STATE.START:
			if(withinRectangle(mouse.x, mouse.y,
							this.BUTTON_GRAPHICS.SEA_X, this.BUTTON_GRAPHICS.SEA_Y,
							this.BUTTON_GRAPHICS.SEA.width, this.BUTTON_GRAPHICS.SEA.height)) {
				this.state = this.GAME_STATE.DEFAULT;
				this.mode = this.GAME_MODE.SEA;
				this.generatePeaks(this.HEIGHT - 100);
			}
			else if(withinRectangle(mouse.x, mouse.y,
							this.BUTTON_GRAPHICS.MOUNTAIN_X, this.BUTTON_GRAPHICS.MOUNTAIN_Y,
							this.BUTTON_GRAPHICS.MOUNTAIN.width, this.BUTTON_GRAPHICS.MOUNTAIN.height)) {
				this.state = this.GAME_STATE.DEFAULT;
				this.mode = this.GAME_MODE.MOUNTAIN;
				this.generatePeaks(this.HEIGHT - 100);
			}
      else if(withinRectangle(mouse.x, mouse.y,
        0, this.HEIGHT / 6 + 60,
       this.WIDTH, 80)) {
         this.state = this.GAME_STATE.INSTRUCTIONS;
       }
       else if(withinRectangle(mouse.x, mouse.y,
         0, this.HEIGHT / 6 + 160,
        this.WIDTH, 80)) {
          this.state = this.GAME_STATE.CREDITS;
        }
			break;
		}

	},

 }

 app.inputHandler = {
	 leftHand: undefined,
	 rightHand: undefined,
	 operator: undefined,
	 checkBox: undefined,
	 effect: undefined,
	 enableNode: undefined,
	 disableNode: undefined,
	 addCommandButton: undefined,

	 init: function() {
		 //TODO: Rethink this.  There are some things in here that are good in theory but don't work in practice
		 //this.leftHand = document.getElementById('leftHand');
		 //this.rightHand = document.getElementById('rightHand');
		 //this.operator = document.getElementById('operator');
		 //this.effect = document.getElementById('effect');
		 //this.enableNode = document.getElementById('enableNode');
		 //this.disableNode = document.getElementById('disableNode');
		 //this.checkBox = document.getElementById('enableCheckBox');
		 //this.addCommandButton = document.getElementById('addCommandNode');

		 //this.addCommandButton.onclick = this.processInputs;
	 },

	 processInputs: function(){
		 var leftHandValue = app.inputHandler.handleOperands(app.inputHandler.leftHand.value);
		 var rightHandValue = app.inputHandler.handleOperands(app.inputHandler.rightHand.value);

		 switch(app.inputHandler.operator.value) {
			 case"==":
				switch(app.inputHandler.effect.value) {
						case "TH":
						app.rocket.aiFunctions.push(function(){
							if(leftHandValue == rightHandValue ) {
										app.rocket.throttleOn();
								}
							});
						break;
						case "RC":
						app.rocket.aiFunctions.push(function(){
							if(leftHandValue == rightHandValue ) {
										app.rocket.gimbal(1);
								}
							});
						break;

					}
			 break;
			 case"!=":

			 break;
			 case">" :

			 break;
			 case">=":

			 break;
			 case"<" :

			 break;
			 case"<=":

			 break;
			 default:
			 break;
		 }

	 },

	 handleOperands: function(value){
		 switch(value) {
			case "XP" :
			return app.rocket.position.x;
			break;
			case "YP" :
			return app.rocket.position.y;
			break;
			case "XV" :
			return app.rocket.velocity.x;
			break;
			case "YV" :
			return app.rocket.velocity.V;
			break;
			case "SP" :
			return app.rocket.velocity.length();
			break;
			case "RO" :
			return app.rocket.rotation
			break;
			case "DX" :
			return app.main.target.x;
			break;
			case "DY" :
			return app.main.target.y;
			break;
			case "LS" :
			return app.main.maxLandingVelocity;
			break;
			case "FL" :
			return app.rocket.fuelPercentage;
			break;
			case "0"  :
			return 0;
			break;
			case "1"  :
			return 1;
			break;
			case "5"  :
			return 5;
			break;
			case "10" :
			return 10;
			break;
			case "45" :
			return 45;
			break;
			case "90" :
			return 90;
			break;
			case "-1" :
			return -1;
			break;
			case "-5" :
			return -5;
			break;
			case "-10":
			return -10;
			break;
			case "-45":
			return -45;
			break;
			case ".1" :
			return .1;
			break;
			case ".2" :
			return .2;
			break;
			case ".5" :
			return .5;
			break;
			case ".7" :
			return .7;
			break;
			case ".9" :
			return .9;
			break;
			default:
			return 0;
		 }
	 },

	 handleNodeNumber: function(value){
		 switch(value) {
			 case "NO" :
			 return -1;
			 case "N1" :
			 return 0;
			 case "N2" :
			 return 1;
			 case "N3" :
			 return 2;
			 case "N4" :
			 return 3;
			 case "N5" :
			 return 4;
			 case "N6" :
			 return 5;
			 case "N7" :
			 return 6;
			 case "N8" :
			 return 7;
			 case "N9" :
			 return 8;
			 case "N10":
			 return 9;
			 default:
			 return -1;

		 }
	 }

 }

 /*
Function Name: clamp(val, min, max)
Author: Web - various sources
Return Value: the constrained value
Description: returns a value that is
constrained between min and max (inclusive)
*/
function clamp(val, min, max){
	return Math.max(min, Math.min(max, val));
}
