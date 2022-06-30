import Shader from "./Shader.js";

class ModelShader extends Shader {
	constructor(gl) {
		const vSource = `
			attribute vec3 aPosition;
			attribute vec3 aNormal;
			attribute vec2 aUV;

			uniform mat4 projection;
			uniform mat4 view;
			uniform mat4 model;

			void main(){
				gl_Position = projection * view * model * vec4(aPosition, 1.0);
			}`;
		const fSource = `
			void main(){
				gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
			}`;
		super(gl, vSource, fSource);
	}
}

export default ModelShader;