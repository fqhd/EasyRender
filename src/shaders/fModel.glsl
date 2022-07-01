#if (GL_FRAGMENT_PRECISION_HIGH)
	precision highp float;
#else
	precision mediump float;
#endif

varying vec2 vUV;

uniform sampler2D albedo;

void main(){
	vec3 textureColor = texture2D(albedo, vUV).rgb;
	gl_FragColor = vec4(textureColor, 1.0);
}