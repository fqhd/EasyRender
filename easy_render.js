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
			needsMatrixUpdate: true,
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

function loadModelMatrix(matrix) {
	gl.uniformMatrix4fv(modelShader.uniformLocations.model, false, matrix);
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

// loadTexture function from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
function ERLoadTexture(url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
	gl.texImage2D(
		gl.TEXTURE_2D,
		level,
		internalFormat,
		width,
		height,
		border,
		srcFormat,
		srcType,
		pixel
	);

	const image = new Image();
	image.onload = function () {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			level,
			internalFormat,
			srcFormat,
			srcType,
			image
		);

		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function ERBeginRenderLoop() {
	drawScene();
	objects[0].transform.rotation[0] += 2;
	objects[0].transform.needsMatrixUpdate = true;
	requestAnimationFrame(ERBeginRenderLoop);
}

function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(modelShader.program);
	updateCamera();
	for (const object of objects) {
		drawObject(object);
	}
}

function updateCamera() {
	if (camera.needsProjectionUpdate) {
		updateProjection();
		loadProjection();
		camera.needsProjectionUpdate = false;
	}
	if (camera.needsViewUpdate) {
		updateView();
		loadView();
		camera.needsViewUpdate = false;
	}
}

function drawObject(object) {
	if (object.transform.needsMatrixUpdate) {
		updateModelMatrix(object.transform);
		loadModelMatrix(object.transform.matrix);
		object.transform.needsMatrixUpdate = false;
	}

	gl.bindTexture(gl.TEXTURE_2D, object.texture);

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

function updateModelMatrix(transform) {
	mat4.fromTranslation(transform.matrix, transform.position);
	mat4.rotate(
		transform.matrix,
		transform.matrix,
		toRadians(transform.rotation[0]),
		vec3.fromValues(1, 0, 0)
	);
	mat4.rotate(
		transform.matrix,
		transform.matrix,
		toRadians(transform.rotation[1]),
		vec3.fromValues(0, 1, 0)
	);
	mat4.rotate(
		transform.matrix,
		transform.matrix,
		toRadians(transform.rotation[2]),
		vec3.fromValues(0, 0, 1)
	);
	mat4.scale(transform.matrix, transform.matrix, transform.scale);
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
	uniform mat4 model;

	const vec3 lightPos = vec3(0.0, 100.0, 0.0);
	
	void main(){
		vNormal = (model * vec4(aNormal, 0.0)).xyz;
		vUV = aUV;
		lightDir = aPosition - lightPos;
		gl_Position = projection * view * model * vec4(aPosition, 1.0);
	}`;
	const fSource = `
	varying mediump vec3 vNormal;
	varying mediump vec2 vUV;
	varying mediump vec3 lightDir;

	uniform sampler2D uSampler;

	void main(){
		mediump vec3 unitLightDir = normalize(lightDir);
		mediump float brightness = dot(unitLightDir, vNormal);
		brightness = max(brightness, 0.2);
		mediump vec4 color = texture2D(uSampler, vUV);
		
		gl_FragColor = color;
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
			model: gl.getUniformLocation(program, "model"),
		},
	};
}
