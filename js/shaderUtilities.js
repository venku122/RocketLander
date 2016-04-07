"use strict";

var texture;

var canvas;
var gl;
var textureCanvas
var triangles = new Float32Array([
		-1, -1,
		1, -1,
		-1, 1,
		-1, 1,
		1, -1,
		1, 1
	])
	
var edgeDetectKernel = [
		-1,	-1,	-1,
		-1,	8,	-1,
		-1,	-1,	-1
	]
	
var embossKernel = [
	2, 0, 0,
	0, -1,0,
	0, 0, -1
]

var blurKernel = [
	-1, 2, 1,
	2, 4, 2,
	1, 2, 1
]

var sharpnessKernel = [
	-1,	-1, -1,
	-1,	9,	-1,
	-1,	-1,	-1
]

var bottomSobelKernel = [
	-1, -2, -1,
	0, 0, 0,
	1, 2, 1
]

var defaultKernel = [
	0, 0, 0,
	0, 1,0,
	0, 0, 0
]


var program;

function initWebGL(canvasID, glCanvasID) {
	canvas = document.getElementById( glCanvasID );
	gl = canvas.getContext( 'webgl' );
	
	textureCanvas = document.getElementById( canvasID );
	var textureCtx = textureCanvas.getContext( '2d' );
	
	textureCanvas.width  = 1024,
    textureCanvas.height = 512
	textureCanvas.style.display = 'none';
	canvas.width = textureCanvas.width;
	canvas.height = textureCanvas.height;
	
	// define drawing area of canvas. Bottom corner, width / height
	gl.viewport( 0, 0, gl.drawingBufferWidth * 2, gl.drawingBufferHeight * 2);
	
	// Create a bugger object to store vertices
	var buffer  = gl.createBuffer();
	
	// point buffer at graphic context's ARRAY_BUFFER
	gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
	
	// initialize memory for buffer and populate it. Give
	// WebGL hint contents will not change dynamically.
	gl.bufferData( gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW )
	
	// create vertex shader
	var vertexSource = vertex_shader; // from shader.js
	var vertexShader = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vertexShader, vertexSource );
	gl.compileShader( vertexShader );
	
	// create fragment shader
	var fragmentSource = fragment_shader; // from shader.js
	var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( fragmentShader, fragmentSource );
	gl.compileShader( fragmentShader);
	
	//create a shader program
	program = gl.createProgram();
	gl.attachShader( program, vertexShader );
	gl.attachShader( program, fragmentShader );
	gl.linkProgram( program );
	gl.useProgram( program );
	
	var position = gl.getAttribLocation( program, 'aPosition' );
	gl.enableVertexAttribArray( position );
	gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0, 0);
	
	program.textureCoordAttribute = gl.getAttribLocation(
		program,
		'aTextureCoord'
	);
	gl.enableVertexAttribArray( program.textureCoordAttribute );
	gl.vertexAttribPointer(
		program.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0
	);
	
	program.textureSizeLocation = gl.getUniformLocation(program, "textureSize");
	gl.uniform2f(program.textureSizeLocation, canvas.width, canvas.height);
	
	var d = new Date();
	var n = d.getMilliseconds();
	program.time = gl.getUniformLocation(program, 'time');
	gl.uniform1f(program.time, n);
	
	// the sampler will automatically pass in the bound texture
	program.samplerUniform = gl.getUniformLocation( program, 'uSampler' );
	gl.uniform1i( program.samplerUniform, 0 );
	
	assignKernel(defaultKernel);
	
	texture = gl.createTexture();
}

function getTexture() {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	gl.bindTexture( gl.TEXTURE_2D, texture );
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas
	)
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}

function webGLSetup() {
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	gl.activeTexture( gl.TEXTURE0);
}

function render() {
		//window.requestAnimationFrame(render, canvas);
		
		webGLSetup();
		
		var d = new Date();
		var n = d.getMilliseconds();
		program.time = gl.getUniformLocation(program, 'time');
		gl.uniform1f(program.time, n);
		
		getTexture();
		
		gl.drawArrays( gl.TRIANGLES, 0, 6 );

}


function computeKernelWeight(kernel) {
   var weight = kernel.reduce(function(prev, curr) {
       return prev + curr;
   });
   return weight <= 0 ? 1 : weight;
}
 
function assignKernel(kernel) {
	program.kernelLocation = gl.getUniformLocation(program, 'kernel[0]');
	program.kernelWeightLocation = gl.getUniformLocation(program, 'kernelWeight');
	
	gl.uniform1fv(program.kernelLocation, kernel);
	gl.uniform1f(program.kernelWeightLocation, computeKernelWeight(kernel));
}

function shake(strength, duration) {
	assignKernel(blurKernel);
	
	program.shake = gl.getUniformLocation(program, 'shake');
	gl.uniform1i(program.shake, 1);
	
	program.strength = gl.getUniformLocation(program, 'strength');
	gl.uniform1f(program.strength, strength);
	
	var countDown = function() {
		duration -= .1;
		if(duration > 0) {
			requestAnimationFrame(countDown);
		} else {
			program.shake = gl.getUniformLocation(program, 'shake');
			gl.uniform1i(program.shake, 0);
			assignKernel(defaultKernel);
		}
	}
	
	countDown();
}

