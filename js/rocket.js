// rocket.js
// Dependencies: Victor.js
// Description: 
//This object represents the rocket vehicle. It is responsible  for containing
// its state and drawing itself to the canvas

"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

var GRAVITY = new Victor(0,9.81);
 app.rocket = {
	 
	 width: 3.66,
	 height: 41.2,
	 rotation: 70,
	 massInitial: 409.5,
	 massFinal: 22.2,
	 //thrust: .756
	 thrust: new Victor(0,-756),
	 thrustAccel: undefined,
	 throttle: 1.0,
	 MIN_THROTTLE: .55,
	 MAX_THROTTLE: 1.0,
	 position: new Victor(0,0),
	 velocity: new Victor(0,0),
	 acceleration: new Victor(0,0),
	 ctx: undefined,
	 debug: true,
	 
	 init : function(){
		 //debugger;
		 console.log("app.rocket.init() called");
		 this.position = new Victor(100,200);
		 this.velocity = new Victor(0,0);
		 
		 
	 },
	 
	 //draws the rocket
	 draw : function(ctx){
		 
		 
		 ctx.save();
		 ctx.fillStyle="red";
		 ctx.translate(this.position.x, this.position.y);
		 ctx.rotate(this.rotation * Math.PI/180);
		 //rocket body
		 ctx.fillRect(0,0, this.width, this.height);
		 
		 //rocket legs
		 ctx.fillStyle="black";
		 ctx.fillRect(this.width, this.height, 18,3);
		 ctx.fillRect(this.width-18, this.height, 18,3);
		 
		 ctx.restore();
		 if(this.debug){
			ctx.save();
			ctx.translate(this.position.x, this.position.y);
			//acceleration debug line
			 ctx.beginPath();
			 ctx.strokeStyle="green";
			 ctx.moveTo(0,0);
			 ctx.lineTo(this.acceleration.x, this.acceleration.y);
			 ctx.stroke();
			 
			 //velocity debug line
			 ctx.beginPath();
			 ctx.strokeStyle="yellow";
			 ctx.moveTo(0,0);
			 ctx.lineTo(this.velocity.x, this.velocity.y);
			 ctx.stroke();
			 
			 //thrust debug line
			 ctx.beginPath();
			 ctx.strokeStyle="orange";
			 ctx.moveTo(0,0);
			 ctx.lineTo(this.thrustAccel.x, this.thrustAccel.y);
			 ctx.stroke();
			 
			 
			 //gravity debug line
			 ctx.beginPath();
			 ctx.strokeStyle="black";
			 ctx.moveTo(0,0);
			 ctx.lineTo(GRAVITY.x, GRAVITY.y);
			 ctx.stroke();
			 
			 ctx.restore();
		 }
		 
		 
		 console.log("Current Position: " +this.position);
	 },
	 
	 update : function(dt){
		 
		 this.rotation+=0.5;
		 //reset accelerations
		 this.acceleration=new Victor(0,0);
		 //add accelerations
		 //gravity acceleration downwards
		 this.acceleration.add(GRAVITY);
		 
		 //calculate thrust force
		 this.thrustAccel = this.thrust.clone().multiplyScalar(this.MIN_THROTTLE).divideScalar(this.massFinal).rotateByDeg(this.rotation);
		 this.acceleration.add(this.thrustAccel);
		 console.log("Acceleration due to thrust: " + this.thrustAccel);
		 
		 console.log("Total Acceleration: " + this.acceleration);
		 //update velocity
		 this.velocity.add(this.acceleration.clone().multiplyScalar(dt));
		 
		 //update position
		 this.position.add(this.velocity.clone().multiplyScalar(dt));
	 }
	 
 }
