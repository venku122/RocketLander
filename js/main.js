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
		OPTIONS: 4,
    SPLASH: 5
	}),
	GAME_MODE: {
		MOUNTAIN: 0,
		SEA: 1,
		DESSERT: 2
	},

	 //Properties
	canvas: undefined,
    ctx: undefined,
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

	init : function(){
		if(this.debug) console.log("app.main.init() called");

		// initialize properties
		this.canvas = Draw.canvas;
		this.WIDTH = Draw.canvas.width;
		this.HEIGHT = Draw.canvas.height;
		this.ctx = this.canvas.getContext('2d');

		this.state = this.GAME_STATE.START; //Enable while testing
		//this.state = this.GAME_STATE.SPLASH;


		//set gradient
		this.grd = this.ctx.createLinearGradient(135,206,250, this.HEIGHT),
		this.grd.addColorStop(1, "skyblue"),
		this.grd.addColorStop(0, "white"),
		//this.grd = "skyblue";

		app.rocket.aiFunctions.push(function(){
			if(app.rocket.position.y < app.main.target.y && app.rocket.velocity.y > 10) {
				app.rocket.throttleOn(app.main.calculateDeltaTime());
			} else {
				app.rocket.throttleOff(app.main.calculateDeltaTime());
			}
		});
		app.rocket.aiFunctions.push(function(){
			if(app.rocket.position.x < app.main.target.x && app.rocket.rotation < Math.PI / 4) {
				app.rocket.changeGimbal(-.5, app.main.calculateDeltaTime());
			} else if(app.rocket.position.x > app.main.target.x && app.rocket.rotation < Math.PI / 4){
				app.rocket.changeGimbal(.5, app.main.calculateDeltaTime());
			}
		});
		app.rocket.Emitter = app.Emitter;
    
		this.update();
	},

	imageLoader : function(images) {
		var main = app.main;
		main.BUTTON_GRAPHICS.SEA.src = images.sea.src;
		main.BUTTON_GRAPHICS.MOUNTAIN.src = images.mountain.src;

		main.BUTTON_GRAPHICS.SEA.crossOrigin = "anonymous";
		main.BUTTON_GRAPHICS.SEA.crossOrigin = "anonymous";

		main.BUTTON_GRAPHICS.SEA_X = 35;
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
      this.timer+= dt;
      if(this.timer>= 5 || myKeys.keydown[myKeys.KEYBOARD.KEY_ENTER]) this.state = this.GAME_STATE.START;
      break;

			case this.GAME_STATE.START:

			this.drawBG();
			this.drawUI();
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_M]) {
				this.mode = this.GAME_MODE.MOUNTAIN;
				this.generatePeaks(this.HEIGHT - 100);
				this.state = this.GAME_STATE.DEFAULT;
				//app.audioHandler.playSound(app.audioHandler.SOUNDS.FLIGHT);
			}
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_S]) {
				this.mode = this.GAME_MODE.SEA;
				this.generatePeaks(this.HEIGHT  - 100);
				this.state = this.GAME_STATE.DEFAULT;
				//app.audioHandler.playSound(app.audioHandler.SOUNDS.FLIGHT);
			}

			break;

			case this.GAME_STATE.DEFAULT:

			//get deltaTime

			//collect input
			//change gimbal position
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_A]) app.rocket.changeGimbal(-15, dt);
			if(!app.rocket.autopilot) if(myKeys.keydown[myKeys.KEYBOARD.KEY_D]) app.rocket.changeGimbal(15, dt);
			if(!app.rocket.autopilot) if(!myKeys.keydown[myKeys.KEYBOARD.KEY_D] && !myKeys.keydown[myKeys.KEYBOARD.KEY_A]) app.rocket.changeGimbal(0, dt);

			//check for throttle
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_W]) app.rocket.throttleOn(dt);
			if(!myKeys.keydown[myKeys.KEYBOARD.KEY_W]) app.rocket.throttleOff(dt);
			// TODO: Make a different control scheme or toggle for this as it breaks AI controls


			//update
			app.rocket.update(dt);
			if(this.state == this.GAME_STATE.DEFAULT){
				if(this.checkForCollisions(app.rocket) || this.shakeTimer != null) {
					if( !this.didLandSafely(app.rocket) || this.shakeTimer != null){
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
							this.state = this.GAME_STATE.DESTROYED;
						}
					}
					else{
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
			return true;
		}
	},

	checkForCollisions: function(rocket) {
		for(var i = 0; i < 3; i ++) {
			var index = Math.floor(rocket.position.x) - (Math.floor(rocket.position.x + 5 * i) % 5)
			if(Math.abs(rocket.position.y + rocket.height - this.mountainPeaks[index]) < this.landDifferential ||rocket.position.y + rocket.height > this.mountainPeaks[index]) {
				return true;
			}
		}
		return false;

	},

	drawUI: function(){

		switch(this.state){

      case this.GAME_STATE.SPLASH:

      break;

			case this.GAME_STATE.START:
				//draw menu text
				this.ctx.font=" 40px monospace";
				this.ctx.textAlign = "center";
				this.ctx.fillText("Rocket Lander", this.WIDTH/2,this.HEIGHT/3 );
				//this.ctx.fillText("Press M for Mars or S for sea", this.WIDTH/2,this.HEIGHT/2 )
        this.ctx.fillText("Ocean", 85, this.HEIGHT-175);
        this.ctx.fillText("Mars", 85 + 250, this.HEIGHT-175);
				this.drawButtons();
				break;

			case this.GAME_STATE.DEFAULT:
				this.ctx.font=" 20px monospace";
				this.ctx.textAlign = "center";

				/*this.grd = this.ctx.createLinearGradient(135,206,250, this.HEIGHT),
				this.grd.addColorStop(1, "skyblue"),
				this.grd.addColorStop(0, "white"),*/

				//Create the UI that will represent the in game status of the ship, such as if it is okay to land
				this.ctx.save();
				//Landing Indicator -------------------------------------------------
				this.landingIndicator = {
					X: 0,
					Y: 0,
					radius: 25,
				}
				this.ctx.beginPath();
				this.ctx.arc(this.landingIndicator.X, this.landingIndicator.Y, this.landingIndicator.radius, 0, 2 * Math.PI);
				if(app.rocket.velocity.length() < this.maxLandingVelocity ){
					this.ctx.fillStyle = "green";
				}
				else{
					this.ctx.fillStyle = "red";
				}
				this.ctx.fill();
				//-------------------------------------------------------------------
				//Fuel Indicator ----------------------------------------------------
				//Create a gradient that will map the ammount of fuel to how much has been used
				this.fuelIndicator = {
					X:100,
					Y:0,
					width: 10,
					height:	200,
					fuelGradient: null
				}
				var fuelPercentage = app.rocket.fuel / (app.rocket.massInitial - app.rocket.massFinal)

				if(fuelPercentage > 0.2) {
					this.fuelIndicator.fuelGradient =
						this.ctx.createLinearGradient(this.fuelIndicator.X, this.fuelIndicator.Y,
																this.fuelIndicator.X,
																this.fuelIndicator.Y + this.fuelIndicator.height);
					this.fuelIndicator.fuelGradient.addColorStop(1, "red");
					this.fuelIndicator.fuelGradient.addColorStop(.8, "green");
					this.fuelIndicator.fuelGradient.addColorStop(1 - fuelPercentage, "white");
				}
				else
				{
					this.fuelIndicator.fuelGradient =
						this.ctx.createLinearGradient(this.fuelIndicator.X, this.fuelIndicator.Y,
														this.fuelIndicator.X,
														this.fuelIndicator.Y + this.fuelIndicator.height);
					this.fuelIndicator.fuelGradient.addColorStop(1, "red");
					this.fuelIndicator.fuelGradient.addColorStop(1 - fuelPercentage, "white");
				}

				this.ctx.fillStyle = this.fuelIndicator.fuelGradient;
				this.ctx.fillRect(this.fuelIndicator.X, this.fuelIndicator.Y,
								this.fuelIndicator.width, this.fuelIndicator.height);
				this.ctx.strokeStyle = "black";
				this.ctx.strokeRect(this.fuelIndicator.X, this.fuelIndicator.Y,
								this.fuelIndicator.width, this.fuelIndicator.height)
				//-------------------------------------------------------------------
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

				this.ctx.beginPath();
				this.ctx.moveTo(this.velocityIndicator.X ,
								this.velocityIndicator.Y );
				var targetRadian = map_range(app.rocket.velocity.length(),
												0, this.velocityIndicator.speedBound,
												0, Math.PI);
				var dialX = this.velocityIndicator.X - this.velocityIndicator.radius * Math.cos(targetRadian);
				var dialY = this.velocityIndicator.Y - this.velocityIndicator.radius * Math.sin(targetRadian);
				this.ctx.lineTo(dialX, dialY);
				this.ctx.strokeStyle = "black";
				this.ctx.stroke();

				this.ctx.beginPath();
				this.ctx.moveTo(this.velocityIndicator.X ,
								this.velocityIndicator.Y );
				targetRadian = map_range(this.maxLandingVelocity,
												0, this.velocityIndicator.speedBound,
												0, Math.PI);
				dialX = this.velocityIndicator.X - this.velocityIndicator.radius * Math.cos(targetRadian);
				dialY = this.velocityIndicator.Y - this.velocityIndicator.radius * Math.sin(targetRadian);
				this.ctx.lineTo(dialX, dialY);
				this.ctx.strokeStyle = "yellow";
				this.ctx.stroke();

				this.ctx.beginPath();
				this.ctx.arc(this.velocityIndicator.X, this.velocityIndicator.Y, this.velocityIndicator.radius, Math.PI, 2*Math.PI);
				this.ctx.closePath();
				this.ctx.strokeStyle = "black";
				this.ctx.stroke();
				//-------------------------------------------------------------------

				this.ctx.restore();

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
				this.ctx.font=" 40px monospace";
				this.ctx.textAlign = "center";
				this.ctx.fillText("The rocket has landed!", this.WIDTH/2,this.HEIGHT/3 );
				this.ctx.fillText("Press space to Restart", this.WIDTH/2,this.HEIGHT/3 + 50 );
			break;
			case this.GAME_STATE.DESTROYED:
				//draw menu text
				this.ctx.font=" 40px monospace";
				this.ctx.textAlign = "center";
				this.ctx.fillText("You were destroyed", this.WIDTH/2,this.HEIGHT/3 );
				this.ctx.fillText("Press space to Restart", this.WIDTH/2,this.HEIGHT/3 + 50 );
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

	drawButtons: function() {
		var seaX, seaY;
		seaX = 35;
		seaY = this.HEIGHT / 3 * 2;
		this.ctx.drawImage(this.BUTTON_GRAPHICS.SEA, this.BUTTON_GRAPHICS.SEA_X, this.BUTTON_GRAPHICS.SEA_Y, this.BUTTON_GRAPHICS.SEA.width, this.BUTTON_GRAPHICS.SEA.height);
		this.ctx.strokeRect(this.BUTTON_GRAPHICS.SEA_X, this.BUTTON_GRAPHICS.SEA_Y, this.BUTTON_GRAPHICS.SEA.width, this.BUTTON_GRAPHICS.SEA.height )

		this.ctx.drawImage(this.BUTTON_GRAPHICS.MOUNTAIN, this.BUTTON_GRAPHICS.MOUNTAIN_X, this.BUTTON_GRAPHICS.MOUNTAIN_Y, this.BUTTON_GRAPHICS.MOUNTAIN.width, this.BUTTON_GRAPHICS.MOUNTAIN.height);
		this.ctx.strokeRect(this.BUTTON_GRAPHICS.MOUNTAIN_X, this.BUTTON_GRAPHICS.MOUNTAIN_Y, this.BUTTON_GRAPHICS.MOUNTAIN.width, this.BUTTON_GRAPHICS.MOUNTAIN.height )
	},

	doMouseDown: function(e) {
			var mouse = getMouse(e);

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
				break;
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
