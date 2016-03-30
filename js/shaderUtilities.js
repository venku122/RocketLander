"use strict";

var texture;

var gl;
var textureCanvas

function initWebGL(canvasID, glCanvasID) {
	var canvas = document.getElementByID( glCanvasID );
	gl = canvas.getContext( 'webgl' );
	
	textureCanvas = document.getElementById( canvasID );
	var textureCtx = textureCanvas.getContext( '2d' );
	
	canvas.width = textureCanvas.width;
	canvas.height = textureCanvas.height;
	
	// define drawing area of canvas. Bottom corner, width / height
	gl.viewport( 0, 0, gl.drawingBufferWidth * 2, gl.drawingBufferHeight * 2);
	
	// Create a bugger object to store vertices
	buffer  = gl.createBuffer();
	
	// point buffer at graphic context's ARRAY_BUFFER
	gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
	
	var triangles = new Float32Array([
		-1, -1,
		1, -1,
		-1, 1,
		-1, 1,
		1, -1,
		1, 1
	])
	
	// initialize memory for buffer and populate it. Give
	// WebGL hint contents will not change dynamically.
	gl.bufferData( gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW )
	
	// create vertex shader
	var vertexSource = vertex_shader; // from shader.js
	var vertexShader = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vertexShader, vertexSource );
	gl.compileShader( vertexShader );
	
	// create fragment shader
	var fragmentSource = fragement_shader; // from shader.js
	var fragmentShader = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( fragementShader, fragmentSource );
	gl.compileShader( fragmentShader);
	
	//creaqte a shader program
	var program = gl.createProgram();
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
	
	// the sampler will automatically pass in the bound texture
	program.samplerUniform = gl.getUniformLocation( program, 'uSampler' );
	gl.uniform1i( program.samplerUniform, 0 );
	
	texture = gl.createTexture();
}

function getTexture() {
	gl.pixelStorei(gl.UNPCAK_FLIP_Y_WEBGL, true);
	
	gl.bindTexture( gl.TEXTURE_2D, texture );
	gl.textImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas
	)
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
}

function webGLSetup() {
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	gl.activeTexture( gl.TEXTURE0);
}


