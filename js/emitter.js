// emitter.js
// author: Tony Jefferson
// last modified: 10/7/2015

"use strict";
var app = app || {};

app.Emitter=function(){

	function Emitter(){
		// public
		this.numParticles = 25;
		this.useCircles = true;
		this.useSquares = false;
		this.xRange = 4;
		this.yRange = 4;
		this.minXspeed = -1;
		this.maxXspeed = 1;
		this.minYspeed = 2;
		this.maxYspeed = 4;
		this.startRadius = 4;
		this.expansionRate = 0.3
		this.decayRate = 2.5;
		this.lifetime = 100;
		this.red = 0;
		this.green = 0;
		this.blue = 0;

		// private
		this._particles = undefined;
	};


	// "public" methods
	var p=Emitter.prototype;

	p.createParticles = function(emitterPoint){
		// initialize particle array
		this._particles = [];

		// create exhaust particles
		for(var i=0; i< this.numParticles; i++){
			// create a particle object and add to array
			var p = {};
			this._particles.push(_initParticle(this, p, emitterPoint, new Victor(0,0)));
		}

		// log the particles
		//console.log(this._particles );
	};

	p.update = function(emitterPoint, dt, currentSpeed){
		/* move and draw particles */
			// each frame, loop through particles array
			// move each particle down screen, and slightly left or right
			// make it bigger, and fade it out
			// increase its age so we know when to recycle it

			for(var i=0;i<this._particles.length;i++){
				var p = this._particles[i];

				p.age += this.decayRate;
				p.r += this.expansionRate;
			//	p.xSpeed *=1.1;
			//	p.ySpeed *=1.1;
				p.x += p.xSpeed;
				p.y += p.ySpeed;

				var alpha = 1 - p.age/this.lifetime;

				// if the particle is too old, recycle it
				if(p.age >= this.lifetime){
					_initParticle(this, p, emitterPoint, currentSpeed);
				}

		}
	}

	p.draw =  function(ctx){
		for(var i=0;i<this._particles.length;i++){
				var p = this._particles[i];
				var alpha = 1 - p.age/this.lifetime;
				ctx.save();
				if(this.useSquares){


					// fill a rectangle
					ctx.fillStyle = "rgba(" + this.red + "," + this.green + "," +
					this.blue + "," + alpha + ")";
					ctx.fillRect(p.x, p.y, p.r, p.r);
					// note: this code is easily modified to draw images
				}

				if(this.useCircles){
					// fill a circle
					ctx.fillStyle = "rgba(" + this.red + "," + this.green + "," +
					this.blue + "," + alpha + ")";

					ctx.beginPath();
					ctx.arc(p.x, p.y, p.r, Math.PI * 2, false);
					ctx.closePath();
					ctx.fill();
				}
				ctx.restore();
		}
	}
	// "private" method
	function _initParticle(obj, p, emitterPoint, initialSpeed){

		// give it a random age when first created
		p.age = getRandom(0,obj.lifetime);

		p.x = emitterPoint.x + getRandom(-obj.xRange, obj.xRange);
		p.y = emitterPoint.y + getRandom(0, obj.yRange);
		p.r = getRandom(obj.startRadius/2, obj.startRadius); // radius
		p.xSpeed = getRandom(obj.minXspeed, obj.maxXspeed) * 2;
	//	p.ySpeed = getRandom(obj.minYspeed, obj.maxYspeed);
	//	p.xSpeed = -initialSpeed.x / 10;
		p.ySpeed = -initialSpeed.y / 5;
		return p;
	};


	return Emitter;
}();
