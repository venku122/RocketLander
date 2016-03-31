var vertex_shader = 
'attribute vec2 aPosition;\n'
+ 'attribute vec2 aTextureCoord;\n'

+ 'varying vec2 vTexCoord;\n'

+ 'uniform bool chaos;'
+ 'uniform bool confuse;'
+ 'uniform bool shake;'
+ 'uniform float time;'

+ 'varying float time_out;'

+'void main() {\n'
	+'vTexCoord = aTextureCoord;\n'
	+'gl_Position = vec4( aPosition, 0, 1 );\n'
	+'if(chaos) {'
		+'float strength = 0.3;'
		+'vec2 pos = vec2(aTextureCoord.x + sin(time) * strength, aTextureCoord.y + cos(time) * strength);'
		+'vTexCoord = pos;'
	+'}'
	+'else {'
		+'vTexCoord = aTextureCoord;'
	+'}'
	+'time_out = time;'
+'}'

var fragment_shader = 
'precision mediump float;\n'
+'varying vec2 vTexCoord;\n'

+'uniform sampler2D uSampler;\n'
+'uniform vec2 offsets[9];'
+'uniform int edge_kernel[9];'
+'uniform float blur_kernel[9];'

+ 'uniform bool chaos;'
+ 'uniform bool confuse;'
+ 'uniform bool shake;'

+ 'varying float time_out;'

+'void main() {\n'
	+'vec3 sample[9];'
	+'if(chaos || shake) {'
		+'for(int i = 0; i < 9; i++) {'
			+'sample[i] = vec3(texture2D(uSampler, vTexCoord.st + offsets[i]));'
	+'}}'
	+'if(chaos) {'
		+'for(int i = 0; i < 9; i++) {'
//			+'gl_FragColor += vec4(sample[i] * edge_kernel[i], 0.0f);'
		+'}'
		+'gl_FragColor.a = 1.0;'
	+'}'
	+'else { '
		+'gl_FragColor = texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t));\n'
		+'gl_FragColor.r *= sin(time_out);'
	+'}'
+'}'