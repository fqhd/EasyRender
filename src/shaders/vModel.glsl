attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec2 vUV;
varying vec3 vNormal;

void main(){
	vUV = aUV;
	vNormal = (model * vec4(aNormal, 0.0)).xyz;
	gl_Position = projection * view * model * vec4(aPosition, 1.0);
}