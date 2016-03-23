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
	 
	 
	 //Properties
	canvas: undefined,
    ctx: undefined,
	animationID: 0,
	HEIGHT: 500,
	WIDTH: 500,
	grd: undefined,
	
	
	init : function(){
		console.log("app.main.init() called");
		// initialize properties
		this.canvas = document.querySelector('canvas');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');
		
		
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
		
		
		//update
		app.rocket.update();
		
		// 5) DRAW	
		// i) draw background
		this.ctx.fillStyle = this.grd; 
		this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT); 
		app.rocket.draw(this.ctx);
	}
 }