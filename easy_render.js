let gl;
let modelShader;
let objects;

const { mat4, vec3 } = glMatrix;

function ERInit() {
	initWebGL();
	initGLState();
	createAllShaders();
}

function ERCreateObject(model, texture) {
	return {
		model,
		texture,
		transform: {
			position: vec3.fromValues(0, 0, 0),
			rotation: vec3.fromValues(0, 0, 0),
			scale: vec3.fromValues(1, 1, 1),
			matrix: mat4.create(),
			needsMatrixUpdate: false,
		},
	};
}

function ERCreateModel(positions, normals, textureCoords) {
	const posBuff = gl.createBuffer();
	const normBuff = gl.createBuffer();
	const uvBuff = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, posBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, normBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuff);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(textureCoords),
		gl.STATIC_DRAW
	);

	numPositions = positions.length / 3;

	return {
		buffers: {
			posBuff,
			normBuff,
			uvBuff,
		},
		numPositions,
	};
}

function ERInitScene(_objects) {
	objects = _objects;
}

function ERBeginRenderLoop() {
	drawScene();
	requestAnimationFrame(ERBeginRenderLoop);
}

function drawScene() {
	gl.useProgram(modelShader.program);
	gl.clear(gl.COLOR_BUFFER_BIT);
	for (const object of objects) {
		drawObject(object);
	}
}

function drawObject(object) {
	gl.bindBuffer(gl.ARRAY_BUFFER, object.model.buffers.posBuff);
	gl.vertexAttribPointer(
		modelShader.attribLocations.aPosition,
		3,
		gl.FLOAT,
		false,
		0,
		0
	);
	gl.enableVertexAttribArray(modelShader.attribLocations.aPosition);

	gl.bindBuffer(gl.ARRAY_BUFFER, object.model.buffers.normBuff);
	gl.vertexAttribPointer(
		modelShader.attribLocations.aNormal,
		3,
		gl.FLOAT,
		false,
		0,
		0
	);
	gl.enableVertexAttribArray(modelShader.attribLocations.aNormal);

	gl.bindBuffer(gl.ARRAY_BUFFER, object.model.buffers.uvBuff);
	gl.vertexAttribPointer(
		modelShader.attribLocations.aUV,
		2,
		gl.FLOAT,
		false,
		0,
		0
	);
	gl.enableVertexAttribArray(modelShader.attribLocations.aUV);

	gl.drawArrays(gl.TRIANGLES, 0, object.model.numPositions);
}

function initWebGL() {
	const canvas = document.getElementById("ERCanvas");
	gl = canvas.getContext("webgl");
}

function initGLState() {
	gl.clearColor(0, 0, 0, 1);
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

	varying vec3 vNormal;
	varying vec2 vUV;
	
	void main(){
		vNormal = aNormal;
		vUV = aUV;
		gl_Position = vec4(aPosition + aNormal*0.01, 1.0);
	}`;
	const fSource = `
	varying mediump vec3 vNormal;
	varying mediump vec2 vUV;

	void main(){
		gl_FragColor = vec4(vUV, 0.0, 1.0);
	}
	`;
	const program = createShaderProgram(vSource, fSource);
	return {
		program,
		attribLocations: {
			aPosition: gl.getAttribLocation(program, "aPosition"),
			aNormal: gl.getAttribLocation(program, "aNormal"),
			aUV: gl.getAttribLocation(program, "aUV"),
		},
	};
}
