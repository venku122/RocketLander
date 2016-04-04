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
 .main is an object literal that is a proaperty of the app global
 This object literal has its own properties and methods (functions)
 
 */
 app.main = {
	 
	 
	 //Game State Machine
	GAME_STATE: Object.freeze({
		START: 0,
		DEFAULT: 1,
		LANDED: 2,
		DESTROYED: 3,
		OPTIONS: 4
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
	
	init : function(){
		if(this.debug) console.log("app.main.init() called");
		// initialize properties
		this.canvas = Draw.canvas;
		this.WIDTH = Draw.canvas.width;
		this.HEIGHT = Draw.canvas.height;
		//this.canvas.width = this.WIDTH;
		//this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');
		
		this.state = this.GAME_STATE.START;
		this.mode = this.GAME_MODE.MOUNTAIN;
		
		this.generatePeaks(this.HEIGHT / 3 * 2);
		
		//set gradient
		this.grd = this.ctx.createLinearGradient(135,206,250, this.HEIGHT),
		this.grd.addColorStop(1, "skyblue"),
		this.grd.addColorStop(0, "white"),
		//this.grd = "skyblue";
		
		this.update();
	},
	
	update : function(){
		// 1) LOOP
		// schedule a call to update()
	 	//requestAnimationFrame(function(){app.main.update()});
		//requestAnimationFrame(function(){this.update();});
		//requestAnimationFrame(this.update.bind(this));
		this.animationID = requestAnimationFrame(this.update.bind(this));
		
		if(myKeys.keydown[myKeys.KEYBOARD.KEY_U]){
			this.debug=!this.debug;
			app.rocket.debug = this.debug;
		} 
		
		switch(this.state){
			
			case this.GAME_STATE.START:
			
			this.drawBG();
			this.drawUI();
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_E]) this.state = this.GAME_STATE.DEFAULT;

			break;
			
			case this.GAME_STATE.DEFAULT:
			
			//get deltaTime
			var dt = this.calculateDeltaTime();
			
			//collect input
			//change gimbal position
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_A]) app.rocket.changeGimbal(-15, dt);
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_D]) app.rocket.changeGimbal(15, dt);
			if(!myKeys.keydown[myKeys.KEYBOARD.KEY_D] && !myKeys.keydown[myKeys.KEYBOARD.KEY_A]) app.rocket.changeGimbal(0, dt);
			
			//check for throttle
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_W]) app.rocket.throttleOn(dt);
			if(!myKeys.keydown[myKeys.KEYBOARD.KEY_W]) app.rocket.throttleOff(dt);
			
			
			//update
			app.rocket.update(dt);
			if(this.checkForCollisions(app.rocket)) {
				if( !this.didLandSafely(app.rocket) || this.timer != null){
					shake(.005, 1);
					app.rocket.velocity.y = 0;
					app.rocket.velocity.x = 0;
					if(this.timer == null) {
						this.timer = 1;
					} else {
						this.timer -= dt;
					}
					if(this.timer < 0) {
						this.state = this.GAME_STATE.DESTROYED;
					}
				}
				else{
					this.state = this.GAME_STATE.LANDED;
				}
			}
			
			//debugger;
			// 5) DRAW	
				this.drawBG();
				this.drawUI();
			
			//draw mountains
			this.drawTerrain();
			
			//draw rocket
			app.rocket.draw(this.ctx);
			
			if(this.debug) console.log("Delta time: "+ dt);

			break;
			
			case this.GAME_STATE.LANDED:
				this.drawBG();
				this.drawUI();
			break;
			
			case this.GAME_STATE.DESTROYED:
				this.drawBG();
				this.drawUI();
			break;
		}
		
		
		render();
	},
	
	generatePeaks: function(startY){
		this.mountainPeaks = new Array(this.width);
		var y = startY;
		for (var x = 0; x < this.WIDTH; x += this.mountainIndex) {
			var noise = perlin(x, 50);
			this.mountainPeaks[x] = y;
			y += (noise * 5 * (Math.random() > .5 ? 1 : -1));
		}
		
		if(this.mode == this.GAME_MODE.MOUNTAIN) {
			var min = 15;
			var range = 20;
			var rand = map_range(Math.random(), 0, 1, min, min + range);
			rand = Math.round(rand);
			var startIndex = map_range(Math.random(), 0, 1, 0, this.WIDTH / this.mountainIndex);
			startIndex = Math.floor(startIndex);
			this.clearHeight = this.HEIGHT - 200;
			for(x = startIndex * this.mountainIndex; x < startIndex * this.mountainIndex + (rand * this.mountainIndex); x += this.mountainIndex) {
				this.mountainPeaks[x] = this.clearHeight;
			}
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
		if(Math.abs(rocket.position.y - this.mountainPeaks[closestPeakIndex]) > this.landDifferential) {
			if(rocket.velocity.y>=25){
				return false;
			}
			return true;
		}
	},
	
	checkForCollisions: function(rocket) {
		for(var i = 0; i < 3; i ++) {
			var index = Math.floor(rocket.position.x) - (Math.floor(rocket.position.x + 5 * i) % 5)
			if(Math.abs(rocket.position.y + rocket.height - this.mountainPeaks[index]) < this.landDifferential) {
				return true;
			}
			console.log("Target: "+ Math.abs(rocket.position.y + rocket.height - this.mountainPeaks[index]) + ", Differential: " + this.landDifferential)
		}
		return false;
		
	},
	
	drawUI: function(){
		
		switch(this.state){
			
			case this.GAME_STATE.START:
				//draw menu text
				this.ctx.font=" 40px monospace";
				this.ctx.textAlign = "center";
				this.ctx.fillText("Rocket Lander", this.WIDTH/2,this.HEIGHT/3 );
				this.ctx.fillText("Press E to start", this.WIDTH/2,this.HEIGHT/2 )
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
				this.ctx.font=" 40px monospace";
				this.ctx.textAlign = "center";
				this.ctx.fillText("The rocket has landed!", this.WIDTH/2,this.HEIGHT/3 );
			break;
			case this.GAME_STATE.DESTROYED:
				//draw menu text
				this.ctx.font=" 40px monospace";
				this.ctx.textAlign = "center";
				this.ctx.fillText("You were destroyed", this.WIDTH/2,this.HEIGHT/3 );
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
				this.ctx.beginPath();
				if(this.mode == this.GAME_MODE.MOUNTAIN) {
					this.ctx.moveTo(0, this.HEIGHT);
					this.ctx.lineTo(0, this.mountainPeaks[0]);
				} else {
					this.ctx.moveTo(0, this.mountainPeaks[0]);
				}
				for (var x = 0; x < this.WIDTH; x++) {
					var noise = perlin(x, 50);
					this.ctx.lineTo(x, this.mountainPeaks[x]);
				}
				if(this.mode == this.GAME_MODE.MOUNTAIN) {
					this.ctx.lineTo(this.WIDTH, this.HEIGHT);
					this.ctx.fillStyle = "brown";
					this.ctx.fill();
				}
				this.ctx.stroke();
				
				this.ctx.restore();
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