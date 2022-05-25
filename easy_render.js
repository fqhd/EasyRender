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
		color: color,
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

	numPositions = indices.length / 3;

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
	if (!checkIndices(indices)) {
		console.error(
			"EasyRender: invalid model indices. All indices values must be under 65536"
		);
	}
	const posBuff = gl.createBuffer();
	const normBuff = gl.createBuffer();
	const uvBuff = gl.createBuffer();
	const indexBuff = gl.createBuffer();

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

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices),
		gl.STATIC_DRAW
	);

	numPositions = indices.length / 3;

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

function ERCreateTexture(data, w, h) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		w,
		h,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array(data)
	);
	return texture;
}

async function ERLoadTexture(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.src = url;
		image.onload = function () {
			const texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				image
			);
			if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
				gl.generateMipmap(gl.TEXTURE_2D);
			} else {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
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

function optimizeModel(data) {
	const indices = [];
	for (let i = 0; i < data.positions.length; i++) {
		indices.push(i);
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

	const tangents = calc_tangents(positions, textureCoords);

	return {
		positions,
		normals,
		textureCoords,
		tangents,
	};
}

function sub_vec2(a, b) {
	return [a[0] - b[0], a[1] - b[1]];
}

function sub_vec3(a, b) {
	return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function mul_vec3(a, b) {
	return [a[0] * b, a[1] * b, a[2] * b];
}

function calc_tangents(positions, uvs) {
	const tangents = [];

	let j = 0;

	for (let i = 0; i < positions.length; i += 9) {
		const P1 = [positions[i], positions[i + 1], positions[i + 2]];
		const P0 = [positions[i + 3], positions[i + 4], positions[i + 5]];
		const P2 = [positions[i + 6], positions[i + 7], positions[i + 8]];

		const T1 = [uvs[j], uvs[j + 1]];
		const T0 = [uvs[j + 2], uvs[j + 3]];
		const T2 = [uvs[j + 4], uvs[j + 5]];
		j += 6;

		const delta_pos_1 = sub_vec3(P1, P0);
		const delta_pos_2 = sub_vec3(P2, P0);

		const delta_uv_1 = sub_vec2(T1, T0);
		const delta_uv_2 = sub_vec2(T2, T0);

		const r =
			1 / (delta_uv_1[0] * delta_uv_2[1] - delta_uv_1[1] * delta_uv_2[0]);

		const tangent = mul_vec3(
			sub_vec3(
				mul_vec3(delta_pos_1, delta_uv_2[1]),
				mul_vec3(delta_pos_2, delta_uv_1[1])
			),
			r
		);

		tangents.push(tangent[0]);
		tangents.push(tangent[1]);
		tangents.push(tangent[2]);
		tangents.push(tangent[0]);
		tangents.push(tangent[1]);
		tangents.push(tangent[2]);
		tangents.push(tangent[0]);
		tangents.push(tangent[1]);
		tangents.push(tangent[2]);
	}

	return tangents;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function ERDrawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
	gl.uniform1i(modelShader.uniformLocations.textured, 0);

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

function drawTextured(object) {
	gl.bindTexture(gl.TEXTURE_2D, object.texture);
	gl.uniform1i(modelShader.uniformLocations.textured, 1);

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

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.model.buffers.indexBuff);

	gl.drawElements(
		gl.TRIANGLES,
		object.model.numPositions,
		gl.UNSIGNED_SHORT,
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
	gl.enable(gl.DEPTH_TEST);
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
		vec4 worldPos = model * vec4(aPosition, 1.0);
		vNormal = (model * vec4(aNormal, 0.0)).xyz;
		vLightDir = lightPos - worldPos.xyz;
		gl_Position = projection * view * worldPos;
	}`;
	const fSource = `
	varying mediump vec3 vNormal;
	varying mediump vec2 vUV;
	varying mediump vec3 vLightDir;

	uniform mediump vec3 objColor;
	uniform sampler2D uTexture;
	uniform int textured;
	
	void main(){
		mediump vec3 fragColor;
		if(textured == 1){
			fragColor = texture2D(uTexture, vUV).rgb;
		}else{
			fragColor = objColor;
		}
		
		mediump vec3 unitLightDir = normalize(vLightDir);
		mediump float brightness = dot(unitLightDir, vNormal);
		brightness = max(brightness, 0.2);
		
		gl_FragColor = vec4(fragColor * brightness, 1.0);
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
			textured: gl.getUniformLocation(program, "textured"),
		},
	};
}
