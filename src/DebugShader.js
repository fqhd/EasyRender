import Shader from "./Shader.js";

class DebugShader extends Shader {
	constructor(gl, vSource, fSource) {
		super(gl, vSource, fSource);
	}
}

export default async function loadDebugShader(gl){
	const vResponse = await fetch("../src/shaders/vDebug.glsl");
	const vSource = await vResponse.text();

	const fResponse = await fetch("../src/shaders/fDebug.glsl");
	const fSource = await fResponse.text();

	return new DebugShader(gl, vSource, fSource);
}