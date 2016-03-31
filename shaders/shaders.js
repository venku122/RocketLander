var vertex_shader = 
'attribute vec2 aPosition;\n'
+ 'attribute vec2 aTextureCoord;\n'

+ 'varying vec2 vTexCoord;\n'

+'void main() {\n'
	+'vTexCoord = aTextureCoord;\n'
	+'gl_Position = vec4( aPosition, 0, 1 );\n'
+'}'

var fragment_shader = 
'precision mediump float;\n'
+'varying vec2 vTexCoord;\n'

+'uniform sampler2D uSampler;\n'

+'void main() {\n'
	+'gl_FragColor = texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t));\n'
+'}'