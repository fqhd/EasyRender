attribute vec2 aPosition;

varying vec2 vUV;

void main(){
	vUV = (aPosition + vec2(1.0)) / 2.0;
	gl_Position = vec4(aPosition, 0.0, 1.0);
}
