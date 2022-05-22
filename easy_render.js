let gl;
let modelShader;
let ERObjects;
let camera;
// 0 -> Raw
// 1 -> Textured
// 2 -> Normal Mapped

const { mat4, vec3 } = glMatrix;

function ERInit() {
	initWebGL();
	initGLState();
	initCamera();
	createAllShaders();
}

function ERCreateObject(model, texture, normalMap, color) {
	if (!color) {
		color = [1, 1, 1];
	}
	return {
		model,
		texture,
		normalMap,
		color: vec3.fromValues(...color),
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

function checkIndices(indices) {
	const max = Math.pow(2, 16);
	for (const i of indices) {
		if (i >= max) {
			return false;
		}
	}
	return true;
}

function createRawModel(positions, normals, indices) {
	if (!checkIndices(indices)) {
		console.error(
			"EasyRender: invalid model indices. All indices values must be under 65536"
		);
	}
	const posBuff = gl.createBuffer();
	const normBuff = gl.createBuffer();
	const indexBuff = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, posBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, normBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices),
		gl.STATIC_DRAW
	);

	numPositions = indices.length;

	return {
		buffers: {
			posBuff,
			normBuff,
			indexBuff,
		},
		numPositions,
	};
}

function createTexturedModel(positions, normals, indices, textureCoords) {}

function createNormalMappedModel(
	positions,
	normals,
	indices,
	textureCoords,
	tangents
) {}

function ERCreateModel(positions, normals, indices, textureCoords, tangents) {
	if (positions && normals && indices && !tangents && !textureCoords) {
		return createRawModel(positions, normals, indices);
	} else if (positions && normals && indices && textureCoords && !tangents) {
		return createTexturedModel(positions, normals, indices, textureCoords);
	} else if (positions && normals && indices && textureCoords && tangents) {
		return createNormalMappedModel(
			positions,
			normals,
			indices,
			textureCoords,
			tangents
		);
	} else {
		console.error("EasyRender: incorrect model parameters");
		return null;
	}
}

function ERInitScene(_ERObjects) {
	ERObjects = _ERObjects;
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
	requestAnimationFrame(ERBeginRenderLoop);
}

function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(modelShader.program);
	updateCamera();
	for (const object of ERObjects) {
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

function getModelType(model) {
	if (
		model.buffers.posBuff &&
		model.buffers.normBuff &&
		model.buffers.indexBuff &&
		!model.buffers.uvBuff
	) {
		// RawModel
		return 0;
	} else if (
		model.buffers.posBuff &&
		model.buffers.normBuff &&
		model.buffers.indexBuff &&
		model.buffers.uvBuff &&
		!model.buffers.tangentBuff
	) {
		// Textured Model
		return 1;
	} else {
		// Normal Mapped Model
		return 2;
	}
}

function loadColor(color) {
	gl.uniform3fv(modelShader.uniformLocations.color, color);
}

function drawRaw(object) {
	loadColor(object.color);

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

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.model.buffers.indexBuff);

	gl.drawElements(
		gl.TRIANGLES,
		object.model.numPositions,
		gl.UNSIGNED_SHORT,
		0
	);
}

function drawObject(object) {
	// RawModel
	if (object.transform.needsMatrixUpdate) {
		updateModelMatrix(object.transform);
		loadModelMatrix(object.transform.matrix);
		object.transform.needsMatrixUpdate = false;
	}

	const type = getModelType(object.model);
	if (type == 0) {
		drawRaw(object);
	} else if (type == 1) {
		drawTextured(object);
	} else {
		drawNormalMapped(object);
	}
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
	attribute vec3 aTangent;
	attribute vec2 aUV;

	varying vec3 vNormal;
	varying vec3 vLightDir;
	varying vec2 vUV;

	uniform mat4 projection;
	uniform mat4 view;
	uniform mat4 model;

	const vec3 lightPos = vec3(0.0, 100.0, 0.0);
	
	void main(){
		vUV = aUV;
		vNormal = (model * vec4(aNormal, 0.0)).xyz;
		vLightDir = aPosition - lightPos;
		gl_Position = projection * view * model * vec4(aPosition, 1.0);
	}`;
	const fSource = `
	varying mediump vec3 vNormal;
	varying mediump vec2 vUV;
	varying mediump vec3 vLightDir;

	uniform mediump vec3 objColor;
	
	void main(){
		mediump vec3 unitLightDir = normalize(vLightDir);
		mediump float brightness = dot(unitLightDir, vNormal);
		brightness = max(brightness, 0.2);
		
		gl_FragColor = vec4(objColor * brightness, 1.0);
	}`;

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
			color: gl.getUniformLocation(program, "objColor"),
		},
	};
}
