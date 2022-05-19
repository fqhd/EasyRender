let gl;
let modelShader;
let objects;
let camera;

const { mat4, vec3 } = glMatrix;

function ERInit() {
	initWebGL();
	initGLState();
	initCamera();
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

function loadView() {
	gl.uniformMatrix4fv(modelShader.uniformLocations.view, false, camera.view);
}

function loadProjection() {
	gl.uniformMatrix4fv(
		modelShader.uniformLocations.projection,
		false,
		camera.projection
	);
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
	updateCamera();
	loadView();
	loadProjection();
	gl.clear(gl.COLOR_BUFFER_BIT);
	for (const object of objects) {
		drawObject(object);
	}
}

function updateCamera(){
	if(camera.needsProjectionUpdate){
		updateProjection();
		camera.needsProjectionUpdate = false;
	}
	if(camera.needsViewUpdate){
		updateView();
		camera.needsViewUpdate = false;
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

function ERCamGetPos() {
	return camera.position;
}

function ERCamSetPos(x, y, z) {
	vec3.set(camera.position, x, y, z);
	camera.needsViewUpdate = true;
}

function ERCamLookAt(x, y, z) {
	vec3.set(camera.forward, x, y, z);
	camera.needsViewUpdate = true;
}

function ERCamSetFOV(fov) {
	camera.fov = fov;
	camera.needsProjectionUpdate = true;
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

function toRadians(r) {
	return (r * Math.PI) / 180;
}

function updateView() {
	mat4.lookAt(
		camera.view,
		camera.position,
		vec3.add(vec3.create(), camera.position, camera.forward),
		vec3.fromValues(0, 1, 0)
	);
}

function updateProjection() {
	mat4.perspective(
		camera.projection,
		toRadians(camera.fov),
		gl.canvas.clientWidth / gl.canvas.clientHeight,
		0.1,
		1000.0
	);
}

function initCamera() {
	const position = vec3.fromValues(0, 0, -5);
	const forward = vec3.fromValues(0, 0, 1);
	const fov = 70;
	camera = {
		position,
		forward,
		fov,
		needsViewUpdate: true,
		needsProjectionUpdate: true,
		projection: mat4.create(),
		view: mat4.create(),
	};
}

function createModelShader() {
	const vSource = `
	attribute vec3 aPosition;
	attribute vec3 aNormal;
	attribute vec2 aUV;

	varying vec3 vNormal;
	varying vec2 vUV;
	varying vec3 lightDir;

	uniform mat4 projection;
	uniform mat4 view;

	const vec3 lightPos = vec3(10.0, 10.0, 10.0);
	
	void main(){
		vNormal = aNormal;
		vUV = aUV;
		lightDir = aPosition - lightPos;
		gl_Position = projection * view * vec4(aPosition, 1.0);
	}`;
	const fSource = `
	varying mediump vec3 vNormal;
	varying mediump vec2 vUV;
	varying mediump vec3 lightDir;

	void main(){
		mediump vec3 unitLightDir = normalize(lightDir);
		mediump float brightness = dot(unitLightDir, vNormal);
		brightness = max(brightness, 0.2);
		mediump vec3 color = vec3(0.0, 1.0, 0.0);
		
		gl_FragColor = vec4(color * brightness, 1.0);
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
		uniformLocations: {
			projection: gl.getUniformLocation(program, "projection"),
			view: gl.getUniformLocation(program, "view"),
		},
	};
}
