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
	 
	 //vehicle state
	 width: 3.66,
	 height: 41.2,
	 rotation: 0,
	 massInitial: 409.5,
	 massFinal: 22.2,
	 currentMass: 22.2,
	 centerOfMass: this.height/3 * 2,
	 //moment of inertia
	 //I of Rod(Center) = (mass*Length^2)/12
	 momentOfInertia: undefined,
	 
	 
	 //engine state
	 //thrust: .756
	 thrust: new Victor(0,-756),
	 thrustAccel: undefined,
	 throttle: 1.0,
	 MIN_THROTTLE: .55,
	 MAX_THROTTLE: 1.0,
	 isThrottle: false,
	 GIMBAL_RANGE: 15,
	 GIMBAL_RESPONSE: 2,
	 currentGimbal: 0,
	 
	 //kinematic state
	 position: new Victor(0,0),
	 velocity: new Victor(0,0),
	 acceleration: new Victor(0,0),
	 
	 //api variables
	 ctx: undefined,
	 debug: false,
	 SCALE_FACTOR: 1.5,
	 
	 
	 
	 
	 init : function(){
		 //debugger;
		 console.log("app.rocket.init() called");
		 this.position = new Victor(Draw.canvas.width/2,Draw.canvas.height/8);
		 this.velocity = new Victor(0,0);
		 this.centerOfMass = this.height /3 *2;
		 
		//moment of inertia
		//I of Rod(Center) = (mass*Length^2)/12
		
		 this.momentOfInertia = (this.currentMass * this.centerOfMass * this.centerOfMass)/12;
	 },
	 
	 //draws the rocket
	 draw : function(ctx){
		 
		 
		 
		 if(this.debug){
			 ctx.save();
			 ctx.translate(this.position.x, this.position.y);
			 
			 //acceleration debug line
			 ctx.beginPath();
			 ctx.strokeStyle="green";
			 ctx.moveTo(0,0);
			 ctx.lineTo(this.acceleration.x*this.SCALE_FACTOR, this.acceleration.y*this.SCALE_FACTOR);
			 ctx.stroke();
			 
			 //gravity debug line
			 ctx.beginPath();
			 ctx.strokeStyle="black";
			 ctx.moveTo(0,0);
			 ctx.lineTo(GRAVITY.x*this.SCALE_FACTOR, GRAVITY.y*this.SCALE_FACTOR);
			 ctx.stroke();
			
			//velocity debug line
			 ctx.beginPath();
			 ctx.strokeStyle="yellow";
			 ctx.moveTo(0,0);
			 ctx.lineTo(this.velocity.x, this.velocity.y);
			 ctx.stroke();
			 
			ctx.save();
			
			ctx.rotate(this.rotation * Math.PI/180);
			//free body diagram
			//block
			ctx.fillRect(-5,-5,10,10);
			

			 

			 
			 //thrust debug line
			 //inverted to be more "logical"
			 if(this.isThrottle){
			 ctx.beginPath();
			 ctx.strokeStyle="orange";
			 ctx.moveTo(0,0);
			 ctx.lineTo(-this.thrustAccel.x*this.SCALE_FACTOR, -this.thrustAccel.y*this.SCALE_FACTOR);
			 ctx.stroke();
				}
			 

			 
			 //rotation vector debug line
			 ctx.beginPath;
			 ctx.strokeStyle = "pink";
			 ctx.moveTo(0,0);
			 var rotationVector = new Victor(0,-1);
			 rotationVector.rotateDeg(this.rotation);
			 rotationVector.multiplyScalar(30);
			 ctx.lineTo(rotationVector.x, rotationVector.y);
			 ctx.stroke();
			 console.log(rotationVector);
			 
			 ctx.restore();
			 ctx.restore();
		 }
		 else
		 {
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
		 }
		 
		 
		 console.log("Current Position: " +this.position);
	 },
	 
	 update : function(dt){
		 
		 //angular motion
		 //torque = centerOfMass* Thrust * gimbal angle
		 if(this.isThrottle){
		 var torque = this.centerOfMass* this.thrust.clone().y * this.currentGimbal;
		 //acceleration = torque force / Moment of Inertia
		 var angularAcceleration = torque / this.momentOfInertia;
		 
		 this.rotation += angularAcceleration * dt;
		 console.log("rotation: " + this.rotation + " Angular Acceleration: " + angularAcceleration + " Torque: " + torque);
		 }
		
		//linear motion
		 //reset accelerations
		 this.acceleration=new Victor(0,0);
		 //add accelerations
		 //gravity acceleration downwards
		 this.acceleration.add(GRAVITY);
		 
		 //calculate thrust force
		 //debugger;
		 if(this.isThrottle){
		 this.thrustAccel = this.thrust.clone().rotateDeg(this.rotation).multiplyScalar(this.MIN_THROTTLE).divideScalar(this.massFinal);
		 //this.thrustAccel = this.thrust.clone().multiplyScalar(this.MIN_THROTTLE).divideScalar(this.massFinal);

		 this.acceleration.add(this.thrustAccel);
		 console.log("Acceleration due to thrust: " + this.thrustAccel);
		 }
		 
		 console.log("Total Acceleration: " + this.acceleration);
		 //update velocity
		 this.velocity.add(this.acceleration.clone().multiplyScalar(dt));
		 
		 //update position
		 this.position.add(this.velocity.clone().multiplyScalar(dt));
	 },
	 
	 borderCheck : function(){
		 if(this.position.x> app.main.WIDTH){
			 console.log("Out of Bounds");
		 }
		 
		 if(this.position.y> app.main.HEIGHT){
			 console.log("Out of Bounds");
		 }
		 
		 if(this.position.x<0){
			 console.log("Out of Bounds");
		 }
		 
		 if(this.position.y<0){
			 console.log("Out of Bounds");
		 }
	 },
	 
	 changeGimbal : function(targetValue, dt){
		 
		 //check if targeted value is possible
		 if(targetValue>this.GIMBAL_RANGE) targetValue=this.GIMBAL_RANGE;
		 if(targetValue<-this.GIMBAL_RANGE) targetValue = -this.GIMBAL_RANGE;
		 
		 if(this.currentGimbal<targetValue) this.currentGimbal+= this.GIMBAL_RESPONSE * dt;
		 if(this.currentGimbal>targetValue) this.currentGimbal-= this.GIMBAL_RESPONSE * dt;
		 
		 
		 console.log("current gimbal position: " +this.currentGimbal);
		 console.log(dt);
		 
	 },
	 
	 throttleOn : function(dt){
		 if(this.isThrottle!=true) this.isThrottle=true;
		 //debugger;
		 console.log("Throttle On called");
	 },
	 
	 throttleOff : function(dt){
		 if(this.isThrottle!=false) this.isThrottle=false;
		 //debugger;
		 console.log("Throttle Off called");
	 }
	 
 }
