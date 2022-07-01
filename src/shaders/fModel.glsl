#if (GL_FRAGMENT_PRECISION_HIGH)
	precision highp float;
#else
	precision mediump float;
#endif

varying vec2 vUV;
varying vec3 vNormal;

uniform sampler2D albedo;

void main(){
	vec3 textureColor = texture2D(albedo, vUV).rgb;
	float brightness = max(dot(vNormal, vec3(0.0, 0.0, -1.0)), 0.2);

	gl_FragColor = vec4(textureColor * brightness, 1.0);
}