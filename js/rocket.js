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
//	 massInitial: 409.5,
   massInitial: 50.0,
	 massFinal: 22.2,
	 currentMass: 22.2,
	 centerOfMass: this.height/3 * 2,
   fuel: -1,
	 //moment of inertia
	 //I of Rod(Center) = (mass*Length^2)/12
	 momentOfInertia: undefined,
   rocketTop: undefined,
   rocketBottom: undefined,


	 //engine state
	 //thrust: .756
	 thrust: new Victor(0,-756),
	 thrustAccel: undefined,
	 throttle: 1.0,
	 MIN_THROTTLE: .55,
	 MAX_THROTTLE: 1.0,
   massFlowRate: .2736,
	 isThrottle: false,
	 GIMBAL_RANGE: 10,
	 GIMBAL_RESPONSE: 7,
	 currentGimbal: 0,

	 //kinematic state
	 position: new Victor(0,0),
	 velocity: new Victor(0,0),
	 acceleration: new Victor(0,0),

	 //api variables
	 ctx: undefined,
	 debug: false,
	 SCALE_FACTOR: 10,
	 Emitter: undefined, // required - loaded by loader.js
	 exhaust: undefined,
	 //graphics
	 ROCKET_SPRITE: {
		 DEPLOYED: new Image(),
		 STOWED: new Image()
	 },
	 //autopilot
	 autopilot: false,
	 aiFunctions: [],




	 init : function(images){

		 var rocket = app.rocket;
		 console.log("app.rocket.init() called");

		 //load images
		 rocket.ROCKET_SPRITE.DEPLOYED.src = images.deployed.src;
		 rocket.ROCKET_SPRITE.STOWED.src = images.stowed.src;

		 rocket.ROCKET_SPRITE.STOWED.crossOrigin = "anonymous";
		 rocket.ROCKET_SPRITE.DEPLOYED.crossOrigin = "anonymous";



		 // width/height with respect to images
		 rocket.width =  rocket.ROCKET_SPRITE.DEPLOYED.width / rocket.SCALE_FACTOR;
		 rocket.height = rocket.ROCKET_SPRITE.DEPLOYED.height / rocket.SCALE_FACTOR;


		 //positional settings
		 rocket.position = new Victor(Draw.canvas.width/2,Draw.canvas.height/8);
		 rocket.velocity = new Victor(0,0);
     rocket.fuel = rocket.massInitial - rocket.massFinal;
     rocket.currentMass = rocket.massInitial;
		 rocket.centerOfMass = rocket.height /3 *2;

     //positionl vetors
     rocket.rocketTop = rocket.position.clone().addScalarX(rocket.width/2);
     rocket.rocketBottom = rocket.rocketTop.clone();
     rocket.rocketBottom.add(new Victor(0, rocket.height));
     rocket.rocketBottom.rotateDeg(rocket.rotation);

		//moment of inertia
		//I of Rod(Center) = (mass*Length^2)/12

		 rocket.momentOfInertia = (rocket.currentMass * rocket.centerOfMass * rocket.centerOfMass)/12;

		 rocket.aiFunctions = new Array();

		 rocket.exhaust = new rocket.Emitter();
		 rocket.exhaust.numParticles =100;
		 rocket.exhaust.red=255;
		 rocket.exhaust.green=150;
		 rocket.exhaust.createParticles({x:0, y:0});
	 },

	 //draws the rocket
	 draw : function(ctx){



		 if(this.debug){

      ctx.fillStyle="yellow";
       ctx.fillRect(this.rocketTop.x, this.rocketTop.y, 5,5);
       ctx.fillStyle="red";
       ctx.fillRect(this.rocketBottom.x, this.rocketBottom.y, 5,5);

			 ctx.save();
			 ctx.translate(this.position.x + this.width/2, this.position.y);

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
			ctx.fillRect(-5,this.centerOfMass-5,10,10);

			//Rocket Cylinder
			ctx.fillRect(-2,0,2,this.height );

			 //thrust debug line
			 //inverted to be more "logical"
			 if(this.isThrottle){
			 ctx.save();
			 ctx.translate(0, this.height);
			 ctx.rotate(this.currentGimbal * Math.PI / 180);
			 ctx.beginPath();
			 ctx.strokeStyle="orange";
			 ctx.moveTo(0,0);
			 ctx.lineTo(-this.thrustAccel.x*this.SCALE_FACTOR, -this.thrustAccel.y*this.SCALE_FACTOR);
			 ctx.stroke();
			 ctx.restore();
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
		 //ctx.fillRect(0,0, this.width, this.height);
		 ctx.drawImage(this.ROCKET_SPRITE.DEPLOYED,0,0, this.width, this.height);

		 //thrust vector
		 if(this.isThrottle){

			 ctx.save();
			 ctx.translate(this.width/2, this.height);
			 ctx.rotate(this.currentGimbal * Math.PI / 180);
			 ctx.beginPath();
			 ctx.strokeStyle="orange";
			 ctx.moveTo(0,0);
			 ctx.lineTo(-this.thrustAccel.x*this.SCALE_FACTOR, -this.thrustAccel.y*this.SCALE_FACTOR);
			 ctx.stroke();

			  //exhaust
			this.exhaust.draw(ctx);
			 ctx.restore();
			 }


		 ctx.restore();
		 }


		 if(this.debug) console.log("Current Position: " +this.position);
	 },

	 update : function(dt){

		 //angular motion
		 //torque = centerOfMass* Thrust * gimbal angle
		 if(this.isThrottle){
		 var torque = (this.height - this.centerOfMass)* this.thrust.clone().y * this.currentGimbal;
		 //acceleration = torque force / Moment of Inertia
		 var angularAcceleration = torque / this.momentOfInertia;

		 this.rotation += angularAcceleration * dt;
		 }

		//linear motion
		 //reset accelerations
		 this.acceleration=new Victor(0,0);
		 //add accelerations
		 //gravity acceleration downwards
		 this.acceleration.add(GRAVITY);

		 //calculate thrust force
		 if(this.isThrottle){
       this.fuel-= (this.massFlowRate * dt * this.throttle);
       this.currentMass = this.massFinal + this.fuel;
		 this.thrustAccel = this.thrust.clone().rotateDeg(this.rotation).multiplyScalar(this.MIN_THROTTLE).divideScalar(this.currentMass);
		 //this.thrustAccel = this.thrust.clone().multiplyScalar(this.MIN_THROTTLE).divideScalar(this.massFinal);
		//multiplyScalar(Math.sin(this.currentGimbal * Math.PI /180))
		 this.acceleration.add(this.thrustAccel);
		 }

		 //update velocity
		 this.velocity.add(this.acceleration.clone().multiplyScalar(dt));

		 //update position
		 this.position.add(this.velocity.clone().multiplyScalar(dt));

     //update positional vectors
     this.rocketTop = this.position.clone().addScalarX(this.width/2);
     this.rocketBottom = this.rocketTop.clone();
     this.rocketBottom.add(new Victor(0, this.height).rotateDeg(this.rotation));


		 if(this.autopilot) this.runAI();

		 //update exhaust
		 this.exhaust.update({x: 0, y: 0}, dt, this.velocity);


		 if(this.debug){
			 console.log("rotation: " + this.rotation + " Angular Acceleration: " + angularAcceleration + " Torque: " + torque);
			 console.log("Acceleration due to thrust: " + this.thrustAccel);
			 console.log("Total Acceleration: " + this.acceleration);
		 }
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


		 if(this.debug){
		 console.log("current gimbal position: " +this.currentGimbal);
		 console.log(dt);
		 }
	 },

	 changeRotation: function(targetValue, dt){
		 var currentRotation = this.rotation;
		 var dRot = targetValue - currentRotation;

		 if(dRot>0){

		 }
	 },

	 throttleOn : function(dt){
		 if(this.isThrottle!=true) {
       this.isThrottle=true;
       app.audioHandler.playLoop(app.audioHandler.SOUNDS.ENGINE, 6);
     }


		 if(this.debug) console.log("Throttle On called");
	 },

	 throttleOff : function(dt){
		 if(this.isThrottle!=false) {
       this.isThrottle=false;
       app.audioHandler.stopSound(app.audioHandler.SOUNDS.ENGINE);
     }

		 if(this.debug) console.log("Throttle Off called");
	 },

	 runAI: function() {
		 for(var i = 0; i < this.aiFunctions.length; i++) {
			this.aiFunctions[i]();
		 }
	 },
	 reset: function() {
		 var rocket = app.rocket;
		 // width/height with respect to images
		 rocket.width =  rocket.ROCKET_SPRITE.DEPLOYED.width / rocket.SCALE_FACTOR;;
		 rocket.height = rocket.ROCKET_SPRITE.DEPLOYED.height / rocket.SCALE_FACTOR;


		 //positional settings
		 rocket.position = new Victor(Draw.canvas.width/2,Draw.canvas.height/8);
		 rocket.velocity = new Victor(0,0);
		 rocket.centerOfMass = rocket.height /3 *2;



		//moment of inertia
		//I of Rod(Center) = (mass*Length^2)/12

		 rocket.momentOfInertia = (rocket.currentMass * rocket.centerOfMass * rocket.centerOfMass)/12;

		 rocket.aiFunctions = new Array();
	 },

   drawSplash: function(ctx, dt) {
     var shakeX = (Math.random() * 2) - 2;
     var shakeY = (Math.random() * 2) - 2;
     ctx.save();
     ctx.translate(app.main.WIDTH-100 * shakeX * dt, app.main.HEIGHT/4 * shakeY*dt);
     ctx.rotate(45 * (Math.PI / 180));
     ctx.scale(0.4, 0.4);
     ctx.drawImage(app.rocket.ROCKET_SPRITE.STOWED,0,0,app.rocket.ROCKET_SPRITE.STOWED.width,app.rocket.ROCKET_SPRITE.STOWED.height);

     ctx.save();
     ctx.translate(app.rocket.ROCKET_SPRITE.STOWED.width / 2, app.rocket.ROCKET_SPRITE.STOWED.height);
     ctx.rotate(this.currentGimbal * Math.PI / 180);
      //exhaust
      if(app.rocket.exhaust != undefined) {
         app.rocket.exhaust.update({x: 0, y: 0}, dt, this.velocity);
        app.rocket.exhaust.draw(ctx);
      }

     ctx.restore();
     ctx.restore();
   }


 }
