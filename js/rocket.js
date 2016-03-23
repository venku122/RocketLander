// rocket.js
// Dependencies: 
// Description: 
//This object represents the rocket vehicle. It is responsible  for containing
// its state and drawing itself to the canvas

"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};


 app.rocket = {
	 
	 width: 3.66,
	 height: 41.2,
	 massInitial: 409.5,
	 massFinal : 22.2,
	 thrust: .756,
	 throttle: 1.0,
	 MIN_THROTTLE: .55,
	 MAX_THROTTLE: 1.0,
	 position: undefined,
	 velocity: undefined,
	 acceleration: undefined,
	 ctx: undefined,
	 
	 init : function(){
		 //debugger;
		 console.log("app.rocket.init() called");
		 this.position = new Victor(50,50);
		 this.velocity = new Victor(0,0);
		 this.acceleration = new Victor(0,0);
	 },
	 
	 draw : function(ctx){
		 ctx.fillStyle="red";
		 ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
	 },
	 
	 update : function(){
		 
		 //add accelerations
		 
		 //update velocity
		 this.velocity.add(this.acceleration);
		 //update position
		 this.position.add(this.velocity);
	 }
	 
 }
