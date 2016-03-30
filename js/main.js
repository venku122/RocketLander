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
	
	 //Properties
	canvas: undefined,
    ctx: undefined,
	animationID: 0,
	HEIGHT: 500,
	WIDTH: 500,
	lastTime:0, //Used by calculateDeltaTime()
	grd: undefined,
	mountainPeaks: [],
	state: null,
	
	init : function(){
		console.log("app.main.init() called");
		// initialize properties
		this.canvas = Draw.canvas;
		this.WIDTH = Draw.canvas.width;
		this.HEIGHT = Draw.canvas.height;
		//this.canvas.width = this.WIDTH;
		//this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');
		
		this.state = this.GAME_STATE.DEFAULT;
		
		this.generatePeaks(this.HEIGHT / 3 * 2);
		
		//set gradient
		this.grd = this.ctx.createLinearGradient(0,0,0, this.HEIGHT),
		this.grd.addColorStop(0, "white"),
		this.grd.addColorStop(1, "blue"),
		
		this.update();
	},
	
	update : function(){
		// 1) LOOP
		// schedule a call to update()
	 	//requestAnimationFrame(function(){app.main.update()});
		//requestAnimationFrame(function(){this.update();});
		//requestAnimationFrame(this.update.bind(this));
		this.animationID = requestAnimationFrame(this.update.bind(this));
		
		
		switch(this.state){
			
			case this.GAME_STATE.DEFAULT:
			
			//get deltaTime
			var dt = this.calculateDeltaTime();
			
			//update
			app.rocket.update(dt);
			
			// 5) DRAW	
			// i) draw background
			this.ctx.save();
			this.ctx.fillStyle = this.grd; 
			this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT); 
			this.ctx.restore();
			
			//draw rocket
			app.rocket.draw(this.ctx);
			
			break;
		}
		//get deltaTime
		var dt = this.calculateDeltaTime();
		
		//update
		app.rocket.update(dt);
		
		// 5) DRAW	
		// i) draw background
		this.ctx.save();
		this.ctx.fillStyle = this.grd; 
		this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT); 
		this.ctx.restore();
		
		//this.ctx.save();
		
		this.ctx.beginPath();
		
		this.ctx.moveTo(0, this.mountainPeaks[0]);
		for (var x = 0; x < this.WIDTH; x++) {
			var noise = perlin(x, 50);
			
			//this.ctx.lineTo(map_range(x, 0, perlinSize, 0, this.WIDTH), y += (noise * 2 * (Math.random() > .5 ? 1 : -1)));
			this.ctx.lineTo(x, this.mountainPeaks[x]);
		}
		this.ctx.stroke();
		this.ctx.restore();
		
		//draw rocket
		app.rocket.draw(this.ctx);
		
		render();
	},
	
	generatePeaks: function(startY){
		this.mountainPeaks = new Array(this.width);
		var y = startY;
		for (var x = 0; x < this.WIDTH; x += 5) {
			var noise = perlin(x, 50);
			this.mountainPeaks[x] = y;
			y += (noise * 5 * (Math.random() > .5 ? 1 : -1));
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