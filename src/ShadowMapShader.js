import Shader from "./Shader.js";

class ShadowMapShader extends Shader {
	constructor(gl, vSource, fSource) {
		super(gl, vSource, fSource);
	}
}

export default async function loadShadowMapShader(gl){
	const vResponse = await fetch("../src/shaders/vShadowMap.glsl");
	const vSource = await vResponse.text();

	const fResponse = await fetch("../src/shaders/fShadowMap.glsl");
	const fSource = await fResponse.text();

	return new ShadowMapShader(gl, vSource, fSource);
}