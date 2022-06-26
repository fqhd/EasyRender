import Shader from "./Shader";

class ShadowShader extends Shader {
	constructor(gl: WebGLRenderingContext) {
		const vSource = `
			attribute vec3 aPosition;

			uniform mat4 lightSpaceMatrix;
			uniform mat4 model;

			void main(){
				gl_Position = lightSpaceMatrix * model * vec4(aPosition, 1.0);
			}`;
		const fSource = `

			void main(){
				
			}`;
		super(gl, vSource, fSource);
	}
}

export default ShadowShader;
