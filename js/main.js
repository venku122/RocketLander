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
	time: 0,
	target: {},
	
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
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_M]) {
				this.mode = this.GAME_MODE.MOUNTAIN;
				this.generatePeaks(this.HEIGHT / 3 * 2);
				this.state = this.GAME_STATE.DEFAULT;
			}
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_S]) {
				this.mode = this.GAME_MODE.SEA;
				this.generatePeaks(this.HEIGHT / 3 * 2);
				this.state = this.GAME_STATE.DEFAULT;
			}

			break;
			
			case this.GAME_STATE.DEFAULT:
			
			//get deltaTime
			var dt = this.calculateDeltaTime();
			this.time += dt;
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
					this.state = this.GAME_STATE.DEFAULT;
				}
			break;
			
			case this.GAME_STATE.DESTROYED:
				this.drawBG();
				this.drawUI();
				if(myKeys.keydown[myKeys.KEYBOARD.KEY_SPACE])
				{
					app.rocket.reset();
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
			if(rocket.velocity.y>=25){
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
			
			case this.GAME_STATE.START:
				//draw menu text
				this.ctx.font=" 40px monospace";
				this.ctx.textAlign = "center";
				this.ctx.fillText("Rocket Lander", this.WIDTH/2,this.HEIGHT/3 );
				this.ctx.fillText("Press M for Mountain or S for sea", this.WIDTH/2,this.HEIGHT/2 )
				break;
			
			case this.GAME_STATE.DEFAULT:
				this.ctx.font=" 20px monospace";
				this.ctx.textAlign = "center";
				if(app.rocket.velocity.y < 25 && app.rocket.velocity.y > 0){
				this.ctx.fillText("Safe to land", app.rocket.position.x + 100, app.rocket.position.y);
				}
				else{
				this.ctx.fillColor= "red";
				this.ctx.fillText("Not Safe to land", app.rocket.position.x + 100, app.rocket.position.y);
				}
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