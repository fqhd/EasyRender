#if (GL_FRAGMENT_PRECISION_HIGH)
	precision highp float;
#else
	precision mediump float;
#endif

uniform sampler2D ourTexture;

varying vec2 vUV;

void main(){
	gl_FragColor = texture2D(ourTexture, vUV);
}