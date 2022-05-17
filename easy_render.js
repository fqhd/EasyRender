let gl;
let modelShader;

function ERInit() {
	initWebGL();
	initGLState();
	createAllShaders();
}

function ERCreateModel(positions, normals, textureCoords){
	const posBuff = gl.createBuffer();
	const normBuff = gl.createBuffer();
	const uvBuff = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, posBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, normBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

	numPositions = positions.length / 3;

	return {
		buffers: {
			posBuff,
			normBuff,
			uvBuff
		},
		numPositions
	};
}

function initWebGL() {
	const canvas = document.getElementById("ERCanvas");
	gl = canvas.getContext("webgl");
}

function initGLState() {
	gl.clearColor(0, 0, 0, 0);
}

function createShaderProgram(vSource, fSource) {
	const program = gl.createProgram();
	const vs = createShader(gl, gl.VERTEX_SHADER, vSource);
	const fs = createShader(gl, gl.FRAGMENT_SHADER, fSource);
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Failed to link program");
	}

	return program;
}

function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		if (type == gl.VERTEX_SHADER) {
			console.error("Failed to compile vertex shader");
		} else {
			console.error("Failed to compile fragment shader");
		}
	}
	return shader;
}

function createAllShaders() {
	modelShader = createModelShader();
}

function createModelShader() {
	const vSource = `
	attribute vec3 aPosition;
	attribute vec3 aNormal;
	attribute vec2 aUV;
	
	void main(){
		gl_Position = vec4(aPosition, 1.0);
	}`;
	const fSource = `
	void main(){
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}
	`;
	const program = createShaderProgram(vSource, fSource);
	return program;
}
