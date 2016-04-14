// All of these functions are in the global scope

"use strict";

// returns mouse position in local coordinate system of element
function getMouse(e){
	var mouse = {} // make an object
	mouse.x = e.pageX - e.target.offsetLeft;
	mouse.y = e.pageY - e.target.offsetTop;
	return mouse;
}

function withinRectangle(mouseX,mouseY,x,y,width,height){
	if(app.main.debug) app.main.ctx.fillRect(x,y,width,height);
	if(mouseY > y && mouseY < y + height) {
		if(mouseX > x && mouseX < x + width) {
			return true
		} else {
			return false;
		}
	} else {
		return false
	}
}


function getRandom(min, max) {
  	return Math.random() * (max - min) + min;
}

function makeColor(red, green, blue, alpha){
	var color='rgba('+red+','+green+','+blue+', '+alpha+')';
	return color;
}

// Function Name: getRandomColor()
// returns a random color of alpha 1.0
// http://paulirish.com/2009/random-hex-color-code-snippets/
function getRandomColor(){
	var red = Math.round(Math.random()*200+55);
	var green = Math.round(Math.random()*200+55);
	var blue=Math.round(Math.random()*200+55);
	var color='rgb('+red+','+green+','+blue+')';
	// OR	if you want to change alpha
	// var color='rgba('+red+','+green+','+blue+',0.50)'; // 0.50
	return color;
}

function getRandomUnitVector(){
	var x = getRandom(-1,1);
	var y = getRandom(-1,1);
	var length = Math.sqrt(x*x + y*y);
	if(length == 0){ // very unlikely
		x=1; // point right
		y=0;
		length = 1;
	} else{
		x /= length;
		y /= length;
	}

	return {x:x, y:y};
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function simplePreload(imageArray){
	// loads images all at once
	for (var i = 0; i < imageArray.length; i++) {
		var img = new Image();
		img.src = imageArray[i];
	}
}


function loadImagesWithCallback(sources, callback) {
	var imageObjects = [];
	var numImages = sources.length;
	var numLoadedImages = 0;

	for (var i = 0; i < numImages; i++) {
	  imageObjects[i] = new Image();
	  imageObjects[i].onload = function() {
	  	numLoadedImages++;
	  	console.log("loaded image at '" + this.src + "'")
		if(numLoadedImages >= numImages) {
		  callback(imageObjects); // send the images back
		}
	  };

	  imageObjects[i].src = sources[i];
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


 // FULL SCREEN MODE
function requestFullscreen(element) {
	if (element.requestFullscreen) {
	  element.requestFullscreen();
	} else if (element.mozRequestFullscreen) {
	  element.mozRequestFullscreen();
	} else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
	  element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
	  element.webkitRequestFullscreen();
	}
	// .. and do nothing if the method is not supported
};


// This gives Array a randomElement() method
Array.prototype.randomElement = function(){
	return this[Math.floor(Math.random() * this.length)];
}

var perlinSize = 10000;
var xMax = map_range(Math.random(), 0, 1, 0, 100);
var yMax = map_range(Math.random(), 0, 1, 0, 100);

function gradientNode(x, y) {
	var gradientVector = {};
	gradientVector.x = map_range(1 - Math.abs(x - xMax) / perlinSize, 0, perlinSize, -1, 1);
	gradientVector.y = map_range(1 - Math.abs(x - yMax) / perlinSize, 0, perlinSize, -1, 1);
	return gradientVector;
}

// Function to linearly interpolate between a0 and a1
 // Weight w should be in the range [0.0, 1.0]
 function lerp(a0, a1, w) {
     return (1.0 - w)*a0 + w*a1;
 }

 // Computes the dot product of the distance and gradient vectors.
 function dotGridGradient(ix, iy, x, y) {
     // Compute the distance vector
     var dx = x - ix;
     var dy = y - iy;

	 var nodeVector = gradientNode(ix, iy);
     return (dx * nodeVector.x + dy * nodeVector.y);
 }

function perlin(x, y) {

	 // Determine grid cell coordinates
	var x0 = (x > 0.0 ? x : x - 1);
	var x1 = x0 + 1;
	var y0 = (y > 0.0 ? y : y - 1);
	var y1 = y0 + 1;

	// Determine interpolation weights
	// Could also use higher order polynomial/s-curve here
	var sx = x - x0;
	var sy = y - y0;

	// Interpolate between grid point gradients
	var n0, n1, ix0, ix1, value;
	n0 = dotGridGradient(x0, y0, x, y);
	n1 = dotGridGradient(x1, y0, x, y);
	ix0 = lerp(n0, n1, sx);
	n0 = dotGridGradient(x0, y1, x, y);
	n1 = dotGridGradient(x1, y1, x, y);
	ix1 = lerp(n0, n1, 1);
	value = lerp(ix0, ix1, 1);

	return value - 1;
}
