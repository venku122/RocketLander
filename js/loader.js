/*
loader.js
variable 'app' is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of
the game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new empty object literal
const app = window.app || {};
window.app = app;


window.onload = () => {
	console.log("window.onload called");
	//debugger;
	const sources = {
		deployed: "media/images/f9FirstStageLegsFins298x1254.png",
		stowed: "media/images/f9FirstStageNoDeploy100x1198.png"
	};
	const buttonSources = {
		sea: "media/images/SeaButton.png",
		mountain: "media/images/MountainButton.png"
	};
	Draw.init();
	initWebGL('mainCanvas', 'gl');
	app.audioHandler.init();
	app.main.init();
	loadImages(sources, app.rocket.init);
	
	loadImages(buttonSources, app.main.imageLoader);
	app.inputHandler.init();

	canvas.onmousedown = app.main.doMouseDown.bind(app.main);

};

//load images function from html5 canvas tutorials
//http://www.html5canvastutorials.com/tutorials/html5-canvas-image-loader/
function loadImages(sources, callback) {
	const images = {};
	let loadedImages = 0;
	const numImages = Object.keys(sources).length;
	//get num of sources
	for (const src in sources) {
		images[src] = new Image();
		images[src].onload = () => {
			loadedImages += 1;
			if (loadedImages >= numImages) {
				console.log("images loaded");
				callback(images);

			}
		};
		images[src].src = sources[src];

	}
	//callback(images);
}
