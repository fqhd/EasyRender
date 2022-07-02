attribute vec3 aPosition;

uniform mat4 gWVP;

void main(){
	gl_Position = gWVP * vec4(aPosition, 1.0);
}