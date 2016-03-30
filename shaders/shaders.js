var vertex_shader = 'attribute vec2 aPosition;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;

void main() {
	vTexCoord = aTextureCoord;
	gl_Position = vec4( aPosition, 0, 1 );
}'

var fragment_shader = 'precision mediump float;
varying vec2 vTexCoord;

uniform sampler2D uSampler;

voud main() [
	gl_FragColor = texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t));
}'