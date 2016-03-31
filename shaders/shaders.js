var vertex_shader = 
'attribute vec2 aPosition;\n'
+ 'attribute vec2 aTextureCoord;\n'

+ 'varying vec2 vTexCoord;\n'

+ 'uniform float time;'
+ 'uniform bool shake;'
+ 'uniform float strength;'

+ 'varying float time_out;'

+'void main() {\n'
	+'vTexCoord = aTextureCoord;\n'
	+'gl_Position = vec4( aPosition, 0, 1 );\n'
//	+'gl_Position = vec4(cos(time * 10.0), cos(time*15.0), 0, 0);'
//	+'gl_Position.x = 0;'
	+'if(shake) {'
		+'gl_Position.x += cos(time * 10.0) * strength;'
		+'gl_Position.y += cos(time * 15.0) * strength;'
	+'}'
	+'time_out = time;'
+'}'

var fragment_shader = 
'precision mediump float;\n'
+'varying vec2 vTexCoord;\n' //In value

+'uniform sampler2D uSampler;\n'
+'uniform vec2 textureSize;\n'
+'uniform float kernel[9];'
+'uniform float kernelWeight;'

+ 'varying float time_out;'

+'void main() {\n'
	+'vec2 onePixel = vec2(1.0, 1.0) / textureSize;'
	+'vec4 colorSum ='
     +'texture2D(uSampler, vTexCoord + onePixel * vec2(-1, -1)) * kernel[0] +'
     +'texture2D(uSampler, vTexCoord + onePixel * vec2( 0, -1)) * kernel[1] +'
     +'texture2D(uSampler, vTexCoord + onePixel * vec2( 1, -1)) * kernel[2] +'
     +'texture2D(uSampler, vTexCoord + onePixel * vec2(-1,  0)) * kernel[3] +'
     +'texture2D(uSampler, vTexCoord + onePixel * vec2( 0,  0)) * kernel[4] +'
     +'texture2D(uSampler, vTexCoord + onePixel * vec2( 1,  0)) * kernel[5] +'
     +'texture2D(uSampler, vTexCoord + onePixel * vec2(-1,  1)) * kernel[6] +'
     +'texture2D(uSampler, vTexCoord + onePixel * vec2( 0,  1)) * kernel[7] +'
     +'texture2D(uSampler, vTexCoord + onePixel * vec2( 1,  1)) * kernel[8] ;'
	+'gl_FragColor = vec4((colorSum / kernelWeight).rgb, 1.0);'
+'}'