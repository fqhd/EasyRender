"use strict";
let ERgl;
let ERModelShader;
let ERSkyboxShader;
let ERSkyboxModel;
let ERObjects = [];
let ERCamera;

const { mat4, vec3 } = glMatrix;

function ERInit() {
	initWebGL();
	initGLState();
	initCamera();
	createModelShader();
	createSkybox();
}

function createSkybox() {
	createSkyboxModel();
	createSkyboxShader();
}

function createSkyboxModel() {
	const positions = [
		-1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1,
		-1, 1,
	];
	const indices = [
		1, 0, 2, 2, 0, 3, 5, 1, 6, 6, 1, 2, 6, 4, 5, 7, 4, 6, 5, 4, 1, 1, 4, 0, 2,
		3, 6, 6, 3, 7, 0, 4, 3, 3, 4, 7,
	];

	const posBuff = ERgl.createBuffer();
	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, posBuff);
	ERgl.bufferData(
		ERgl.ARRAY_BUFFER,
		new Float32Array(positions),
		ERgl.STATIC_DRAW
	);

	const indicesBuff = ERgl.createBuffer();
	ERgl.bindBuffer(ERgl.ELEMENT_ARRAY_BUFFER, indicesBuff);
	ERgl.bufferData(
		ERgl.ELEMENT_ARRAY_BUFFER,
		new Uint8Array(indices),
		ERgl.STATIC_DRAW
	);

	ERSkyboxModel = {
		posBuff,
		indicesBuff,
	};
}

function createSkyboxShader() {
	const vSource = `
	attribute vec3 aPosition;

	varying vec3 textureCoords;

	uniform mat4 projection;
	uniform mat4 view;

	void main(){
		textureCoords = aPosition;
		gl_Position = projection * view * vec4(aPosition, 1.0);
		gl_Position = gl_Position.xyww;
	}
	`;
	const fSource = `
	varying mediump vec3 textureCoords;

	//Constants
	const lowp float upperLimit = 0.2;
	const lowp float lowerLimit = 0.0;
	const lowp vec3 topColor = vec3(132.0/255.0, 174.0/255.0, 255.0/255.0);
	const lowp vec3 bottomColor = vec3(178.0/255.0, 206.0/255.0, 254.0/255.0);

	void main(){
		mediump float blendFactor = clamp((normalize(textureCoords).y - lowerLimit) / (upperLimit - lowerLimit), 0.0, 1.0);
		gl_FragColor = vec4(mix(bottomColor, topColor, blendFactor), 1.0);
	}
	`;
	const program = createShaderProgram(vSource, fSource);
	ERSkyboxShader = {
		program,
		attribLocations: {
			aPosition: ERgl.getAttribLocation(program, "aPosition"),
		},
		uniformLocations: {
			projection: ERgl.getUniformLocation(program, "projection"),
			view: ERgl.getUniformLocation(program, "view"),
		},
	};
}

function drawSkybox() {
	ERgl.useProgram(ERSkyboxShader.program);

	// Load projection
	ERgl.uniformMatrix4fv(
		ERSkyboxShader.uniformLocations.projection,
		false,
		createProj()
	);

	// Load view
	const view = createView();
	view[12] = 0;
	view[13] = 0;
	view[14] = 0;
	ERgl.uniformMatrix4fv(ERSkyboxShader.uniformLocations.view, false, view);

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, ERSkyboxModel.posBuff);
	ERgl.vertexAttribPointer(
		ERSkyboxShader.attribLocations.aPosition,
		3,
		ERgl.FLOAT,
		false,
		0,
		0
	);
	ERgl.enableVertexAttribArray(ERSkyboxShader.attribLocations.aPosition);

	ERgl.bindBuffer(ERgl.ELEMENT_ARRAY_BUFFER, ERSkyboxModel.indicesBuff);

	ERgl.drawElements(ERgl.TRIANGLES, 36, ERgl.UNSIGNED_BYTE, 0);
}

function ERCreateObject(model, texture, color) {
	if (!color) {
		color = [255, 255, 255];
	}
	return {
		model,
		texture,
		color,
		position: {
			x: 0,
			y: 0,
			z: 0,
		},
		rotation: {
			x: 0,
			y: 0,
			z: 0,
		},
		scale: {
			x: 1,
			y: 1,
			z: 1,
		},
	};
}

function loadView() {
	const view = createView();
	ERgl.uniformMatrix4fv(ERModelShader.uniformLocations.view, false, view);
}

function loadProjection() {
	const proj = createProj();
	ERgl.uniformMatrix4fv(ERModelShader.uniformLocations.projection, false, proj);
}

function loadModelMatrix(matrix) {
	ERgl.uniformMatrix4fv(ERModelShader.uniformLocations.model, false, matrix);
}

function checkIndices(indices) {
	const max = Math.pow(2, 16);
	for (const i of indices) {
		if (i >= max) {
			console.error(
				"EasyRender: invalid model indices. All indices values must be under 65536"
			);
			return;
		}
	}
}

function createRawModel(positions, normals, indices) {
	checkIndices(indices);
	const posBuff = ERgl.createBuffer();
	const normBuff = ERgl.createBuffer();
	const indexBuff = ERgl.createBuffer();

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, posBuff);
	ERgl.bufferData(
		ERgl.ARRAY_BUFFER,
		new Float32Array(positions),
		ERgl.STATIC_DRAW
	);

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, normBuff);
	ERgl.bufferData(
		ERgl.ARRAY_BUFFER,
		new Float32Array(normals),
		ERgl.STATIC_DRAW
	);

	ERgl.bindBuffer(ERgl.ELEMENT_ARRAY_BUFFER, indexBuff);
	ERgl.bufferData(
		ERgl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices),
		ERgl.STATIC_DRAW
	);

	const numPositions = indices.length;

	return {
		buffers: {
			posBuff,
			normBuff,
			indexBuff,
		},
		numPositions,
	};
}

function createTexturedModel(positions, normals, indices, textureCoords) {
	checkIndices(indices);
	const posBuff = ERgl.createBuffer();
	const normBuff = ERgl.createBuffer();
	const uvBuff = ERgl.createBuffer();
	const indexBuff = ERgl.createBuffer();

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, posBuff);
	ERgl.bufferData(
		ERgl.ARRAY_BUFFER,
		new Float32Array(positions),
		ERgl.STATIC_DRAW
	);

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, normBuff);
	ERgl.bufferData(
		ERgl.ARRAY_BUFFER,
		new Float32Array(normals),
		ERgl.STATIC_DRAW
	);

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, uvBuff);
	ERgl.bufferData(
		ERgl.ARRAY_BUFFER,
		new Float32Array(textureCoords),
		ERgl.STATIC_DRAW
	);

	ERgl.bindBuffer(ERgl.ELEMENT_ARRAY_BUFFER, indexBuff);
	ERgl.bufferData(
		ERgl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices),
		ERgl.STATIC_DRAW
	);

	const numPositions = indices.length;

	return {
		buffers: {
			posBuff,
			normBuff,
			uvBuff,
			indexBuff,
		},
		numPositions,
	};
}

function ERCreateModel(positions, normals, indices, textureCoords) {
	if (positions && normals && indices && textureCoords) {
		return createTexturedModel(positions, normals, indices, textureCoords);
	} else if (positions && normals && indices) {
		return createRawModel(positions, normals, indices);
	} else {
		console.error("EasyRender: incorrect model parameters");
		return null;
	}
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

async function ERLoadTexture(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.src = url;
		image.onload = function () {
			const texture = ERgl.createTexture();
			ERgl.bindTexture(ERgl.TEXTURE_2D, texture);
			ERgl.texImage2D(
				ERgl.TEXTURE_2D,
				0,
				ERgl.RGBA,
				ERgl.RGBA,
				ERgl.UNSIGNED_BYTE,
				image
			);
			if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
				ERgl.generateMipmap(ERgl.TEXTURE_2D);
			} else {
				ERgl.texParameteri(
					ERgl.TEXTURE_2D,
					ERgl.TEXTURE_WRAP_S,
					ERgl.CLAMP_TO_EDGE
				);
				ERgl.texParameteri(
					ERgl.TEXTURE_2D,
					ERgl.TEXTURE_WRAP_T,
					ERgl.CLAMP_TO_EDGE
				);
				ERgl.texParameteri(
					ERgl.TEXTURE_2D,
					ERgl.TEXTURE_MIN_FILTER,
					ERgl.LINEAR
				);
			}
			resolve(texture);
		};
		image.onabort = function () {
			reject("ERLoadTexture: failed to load texture: " + url);
		};
	});
}

async function ERLoadModel(url) {
	const data = await loadModelData(url);
	optimizeModel(data);
	return data;
}

function areVerticesIdentical(v1, v2) {
	for (let i = 0; i < v1.length; i++) {
		if (v1[i] != v2[i]) {
			return false;
		}
	}
	return true;
}

function getVertex(data, index) {
	return [
		data.positions[index * 3],
		data.positions[index * 3 + 1],
		data.positions[index * 3 + 2],
		data.normals[index * 3],
		data.normals[index * 3 + 1],
		data.normals[index * 3 + 2],
		data.textureCoords[index * 2],
		data.textureCoords[index * 2 + 1],
	];
}

// O(log(n))
function isVertexProcessed(data, index) {
	const v1 = getVertex(data, index);
	for (let i = 0; i < index; i++) {
		const v2 = getVertex(data, i);
		if (areVerticesIdentical(v1, v2)) {
			return {
				processed: true,
				i,
			};
		}
	}
	return {
		processed: false,
		i: null,
	};
}

function removeVertex(data, i) {
	data.positions.splice(i * 3, 3);
	data.textureCoords.splice(i * 2, 2);
	data.normals.splice(i * 3, 3);
}

function optimizeModel(data) {
	const indices = [];
	for (let i = 0; i < data.positions.length / 3; i++) {
		const v = isVertexProcessed(data, i);
		if (v.processed) {
			indices.push(v.i);
			removeVertex(data, i);
			i--; // This is important please don't remove it
		} else {
			indices.push(i);
		}
	}
	data.indices = indices;
}

async function loadModelData(url) {
	const response = await fetch(url);
	const text = await response.text();
	const lines = text.split("\n");
	const positions_lookup = [];
	const normals_lookup = [];
	const uvs_lookup = [];
	for (let i = 0; i < lines.length; i++) {
		let tokens = lines[i].split(" ");
		switch (tokens[0]) {
			case "v":
				positions_lookup.push(parseFloat(tokens[1]));
				positions_lookup.push(parseFloat(tokens[2]));
				positions_lookup.push(parseFloat(tokens[3]));
				break;
			case "vn":
				normals_lookup.push(parseFloat(tokens[1]));
				normals_lookup.push(parseFloat(tokens[2]));
				normals_lookup.push(parseFloat(tokens[3]));
				break;
			case "vt":
				uvs_lookup.push(parseFloat(tokens[1]));
				uvs_lookup.push(parseFloat(tokens[2]));
				break;
		}
	}

	const positions = [];
	const normals = [];
	const textureCoords = [];

	for (let i = 0; i < lines.length; i++) {
		let tokens = lines[i].split(" ");
		if (tokens[0] == "f") {
			for (let j = 1; j < 4; j++) {
				const curr_token_indices = tokens[j].split("/").map((t) => parseInt(t));

				const pos_index = curr_token_indices[0] - 1;
				positions.push(positions_lookup[pos_index * 3]);
				positions.push(positions_lookup[pos_index * 3 + 1]);
				positions.push(positions_lookup[pos_index * 3 + 2]);

				const uv_index = curr_token_indices[1] - 1;
				textureCoords.push(uvs_lookup[uv_index * 2]);
				textureCoords.push(uvs_lookup[uv_index * 2 + 1]);

				const normal_index = curr_token_indices[2] - 1;
				normals.push(normals_lookup[normal_index * 3]);
				normals.push(normals_lookup[normal_index * 3 + 1]);
				normals.push(normals_lookup[normal_index * 3 + 2]);
			}
		}
	}

	return {
		positions,
		normals,
		textureCoords,
	};
}

function ERDrawScene() {
	ERgl.clear(ERgl.COLOR_BUFFER_BIT | ERgl.DEPTH_BUFFER_BIT);
	drawSkybox();
	drawObjects();
}

function drawObjects() {
	ERgl.useProgram(ERModelShader.program);
	loadCamera();
	for (const object of ERObjects) {
		drawObject(object);
	}
}

function createView() {
	const view = mat4.create();
	const camPosVec = vec3.fromValues(
		ERCamera.position.x,
		ERCamera.position.y,
		ERCamera.position.z
	);
	const camForwardVec = vec3.fromValues(
		Math.cos(toRadians(ERCamera.yaw)) * Math.cos(toRadians(ERCamera.pitch)),
		Math.sin(toRadians(ERCamera.pitch)),
		Math.sin(toRadians(ERCamera.yaw)) * Math.cos(toRadians(ERCamera.pitch))
	);
	mat4.lookAt(
		view,
		camPosVec,
		vec3.add(vec3.create(), camPosVec, camForwardVec),
		vec3.fromValues(0, 1, 0)
	);
	return view;
}

function createProj() {
	const proj = mat4.create();
	mat4.perspective(
		proj,
		toRadians(ERCamera.fov),
		ERgl.canvas.clientWidth / ERgl.canvas.clientHeight,
		0.1,
		1000.0
	);
	return proj;
}

function loadCamera() {
	loadProjection();
	loadView();
	loadCamPos();
}

function loadCamPos() {
	ERgl.uniform3fv(
		ERModelShader.uniformLocations.camPos,
		vec3.fromValues(
			ERCamera.position.x,
			ERCamera.position.y,
			ERCamera.position.z
		)
	);
}

function loadColor(color) {
	ERgl.uniform3fv(
		ERModelShader.uniformLocations.color,
		vec3.fromValues(color[0] / 255, color[1] / 255, color[2] / 255)
	);
}

function drawRaw(object) {
	loadColor(object.color);
	ERgl.uniform1i(ERModelShader.uniformLocations.textured, 0);

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, object.model.buffers.posBuff);
	ERgl.vertexAttribPointer(
		ERModelShader.attribLocations.aPosition,
		3,
		ERgl.FLOAT,
		false,
		0,
		0
	);
	ERgl.enableVertexAttribArray(ERModelShader.attribLocations.aPosition);

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, object.model.buffers.normBuff);
	ERgl.vertexAttribPointer(
		ERModelShader.attribLocations.aNormal,
		3,
		ERgl.FLOAT,
		false,
		0,
		0
	);
	ERgl.enableVertexAttribArray(ERModelShader.attribLocations.aNormal);

	ERgl.bindBuffer(ERgl.ELEMENT_ARRAY_BUFFER, object.model.buffers.indexBuff);

	ERgl.drawElements(
		ERgl.TRIANGLES,
		object.model.numPositions,
		ERgl.UNSIGNED_SHORT,
		0
	);
}

function drawTextured(object) {
	ERgl.bindTexture(ERgl.TEXTURE_2D, object.texture);
	ERgl.uniform1i(ERModelShader.uniformLocations.textured, 1);

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, object.model.buffers.posBuff);
	ERgl.vertexAttribPointer(
		ERModelShader.attribLocations.aPosition,
		3,
		ERgl.FLOAT,
		false,
		0,
		0
	);
	ERgl.enableVertexAttribArray(ERModelShader.attribLocations.aPosition);

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, object.model.buffers.normBuff);
	ERgl.vertexAttribPointer(
		ERModelShader.attribLocations.aNormal,
		3,
		ERgl.FLOAT,
		false,
		0,
		0
	);
	ERgl.enableVertexAttribArray(ERModelShader.attribLocations.aNormal);

	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, object.model.buffers.uvBuff);
	ERgl.vertexAttribPointer(
		ERModelShader.attribLocations.aUV,
		2,
		ERgl.FLOAT,
		false,
		0,
		0
	);
	ERgl.enableVertexAttribArray(ERModelShader.attribLocations.aUV);

	ERgl.bindBuffer(ERgl.ELEMENT_ARRAY_BUFFER, object.model.buffers.indexBuff);

	ERgl.drawElements(
		ERgl.TRIANGLES,
		object.model.numPositions,
		ERgl.UNSIGNED_SHORT,
		0
	);
}

function createModelMatrix(position, rotation, scale) {
	const matrix = mat4.create();
	mat4.fromTranslation(matrix, [position.x, position.y, position.z]);
	mat4.rotate(matrix, matrix, toRadians(rotation.x), vec3.fromValues(1, 0, 0));
	mat4.rotate(matrix, matrix, toRadians(rotation.y), vec3.fromValues(0, 1, 0));
	mat4.rotate(matrix, matrix, toRadians(rotation.z), vec3.fromValues(0, 0, 1));
	mat4.scale(matrix, matrix, [scale.x, scale.y, scale.z]);
	return matrix;
}

function drawObject(object) {
	const { position, rotation, scale } = object;
	const modelMatrix = createModelMatrix(position, rotation, scale);
	loadModelMatrix(modelMatrix);

	if (object.texture) {
		drawTextured(object);
	} else {
		drawRaw(object);
	}
}

function initWebGL() {
	const canvas = document.getElementById("ERCanvas");
	ERgl = canvas.getContext("webgl");
}

function initGLState() {
	ERgl.clearColor(0, 0, 0, 1);
	ERgl.enable(ERgl.DEPTH_TEST);
	ERgl.depthFunc(ERgl.LEQUAL);
	ERgl.enable(ERgl.CULL_FACE);
}

function createShaderProgram(vSource, fSource) {
	const program = ERgl.createProgram();
	const vs = createShader(ERgl.VERTEX_SHADER, vSource);
	const fs = createShader(ERgl.FRAGMENT_SHADER, fSource);
	ERgl.attachShader(program, vs);
	ERgl.attachShader(program, fs);
	ERgl.linkProgram(program);
	if (!ERgl.getProgramParameter(program, ERgl.LINK_STATUS)) {
		console.error("Failed to link program");
	}

	return program;
}

function createShader(type, source) {
	const shader = ERgl.createShader(type);
	ERgl.shaderSource(shader, source);
	ERgl.compileShader(shader);
	if (!ERgl.getShaderParameter(shader, ERgl.COMPILE_STATUS)) {
		if (type == ERgl.VERTEX_SHADER) {
			console.error("Failed to compile vertex shader");
		} else {
			console.error("Failed to compile fragment shader");
		}
	}
	return shader;
}

function toRadians(r) {
	return (r * Math.PI) / 180;
}

function initCamera() {
	ERCamera = {
		position: {
			x: 0,
			y: 0,
			z: 0,
		},
		pitch: 0,
		yaw: 0,
		fov: 70,
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

const getImageData = (image) => {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = image.width;
	canvas.height = image.height;
	context.drawImage(image, 0, 0);
	return context.getImageData(0, 0, canvas.width, canvas.height);
};

function createModelShader() {
	const vSource = `
	attribute vec3 aPosition;
	attribute vec3 aNormal;
	attribute vec2 aUV;

	varying vec3 vNormal;
	varying vec3 vLightDir;
	varying vec2 vUV;
	varying vec3 vToCamVec;

	uniform mat4 projection;
	uniform mat4 view;
	uniform mat4 model;
	uniform vec3 camPos;

	const vec3 lightDir = vec3(0.0, -1.0, -1.0);

	void main(){
		vec4 worldPos = model * vec4(aPosition, 1.0);
		gl_Position = projection * view * worldPos;

		vUV = aUV;
		vNormal = (model * vec4(aNormal, 0.0)).xyz;
		
		vToCamVec = camPos - worldPos.xyz;

		vLightDir = lightDir;
		vToCamVec = camPos - worldPos.xyz;
	}`;
	const fSource = `
	varying mediump vec3 vNormal;
	varying mediump vec2 vUV;
	varying mediump vec3 vToCamVec;
	varying mediump vec3 vLightDir;

	uniform mediump vec3 objColor;
	uniform sampler2D uTexture;
	uniform int textured;

	const mediump float shininess = 2.0;
	const mediump float reflectivity = 0.3;

	void main(){
		mediump vec3 fragColor;
		if(textured == 1){
			fragColor = texture2D(uTexture, vUV).rgb;
		}else{
			fragColor = objColor;
		}

		mediump vec3 unitLightDir = normalize(vLightDir);
		mediump vec3 unitNormal;
		unitNormal = normalize(vNormal);

		mediump vec3 unitToCamVec = normalize(vToCamVec);
		mediump vec3 reflected = reflect(unitLightDir, unitNormal);

		// Diffuse calculation
		mediump float brightness = dot(-unitLightDir, unitNormal);
		brightness = max(brightness, 0.3);

		// Specular Calculation
		mediump float specFactor = dot(reflected, unitToCamVec);
		specFactor = max(specFactor, 0.0);
		specFactor = pow(specFactor, shininess);
		mediump vec3 finalSpec = vec3(1.0) * reflectivity * specFactor;

		gl_FragColor = vec4(fragColor * brightness + finalSpec, 1.0);
	}`;

	const program = createShaderProgram(vSource, fSource);
	ERModelShader = {
		program,
		attribLocations: {
			aPosition: ERgl.getAttribLocation(program, "aPosition"),
			aNormal: ERgl.getAttribLocation(program, "aNormal"),
			aUV: ERgl.getAttribLocation(program, "aUV"),
		},
		uniformLocations: {
			projection: ERgl.getUniformLocation(program, "projection"),
			view: ERgl.getUniformLocation(program, "view"),
			model: ERgl.getUniformLocation(program, "model"),
			color: ERgl.getUniformLocation(program, "objColor"),
			textured: ERgl.getUniformLocation(program, "textured"),
			camPos: ERgl.getUniformLocation(program, "camPos"),
			uTexture: ERgl.getUniformLocation(program, "uTexture"),
		},
	};
}
