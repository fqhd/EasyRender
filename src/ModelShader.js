import Shader from "./Shader.js";

class ModelShader extends Shader {
	constructor(gl, vSource, fSource) {
		super(gl, vSource, fSource);
	}
}

export default async function loadModelShader(gl){
	const vResponse = await fetch("../src/shaders/vModel.glsl");
	const vSource = await vResponse.text();

	const fResponse = await fetch("../src/shaders/fModel.glsl");
	const fSource = await fResponse.text();

	return new ModelShader(gl, vSource, fSource);
}