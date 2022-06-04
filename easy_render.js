"use strict";
let ERgl;
let ERShadowMap;
let ERModelShader;
let ERObjects = [];
let ERCamera;
const SHADOW_WIDTH = 1024;
const SHADOW_HEIGHT = 1024;

const { mat4, vec3, vec4 } = glMatrix;

function ERInit() {
	initWebGL();
	initCamera();
	createModelShader();
	createShadowMap();
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
	drawToShadowMap();
	drawObjects();
}

function ERInitScene(objects) {
	ERObjects = objects;
}

function drawObjects() {
	ERgl.useProgram(ERModelShader.program);
	ERgl.activeTexture(ERgl.TEXTURE1);
	ERgl.bindTexture(ERgl.TEXTURE_2D, ERShadowMap.texture);
	ERgl.uniformMatrix4fv(ERModelShader.uniformLocations.lightSpaceMatrix, false, ERShadowMap.matrix);
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
		Math.sin(toRadians(ERCamera.yaw)) * Math.cos(toRadians(ERCamera.pitch)),
		Math.sin(toRadians(ERCamera.pitch)),
		Math.cos(toRadians(ERCamera.yaw)) * Math.cos(toRadians(ERCamera.pitch))
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
	ERgl.activeTexture(ERgl.TEXTURE0);
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
	ERgl.clearColor(0.7, 0.81, 1, 1);
	ERgl.enable(ERgl.DEPTH_TEST);
	ERgl.depthFunc(ERgl.LEQUAL);
	ERgl.enable(ERgl.CULL_FACE);
	if (!ERgl.getExtension("WEBGL_depth_texture")) {
		alert(
			"Your browser doesn't support the WEBGL_depth_texture extension. This application may not work"
		);
		console.log("Missing Extension: WEBGL_depth_texture");
	}
}

function createShadowMap() {
	const framebuffer = ERgl.createFramebuffer();
	const texture = ERgl.createTexture();
	ERgl.bindTexture(ERgl.TEXTURE_2D, texture);
	ERgl.texImage2D(
		ERgl.TEXTURE_2D,
		0,
		ERgl.DEPTH_COMPONENT,
		SHADOW_WIDTH,
		SHADOW_HEIGHT,
		0,
		ERgl.DEPTH_COMPONENT,
		ERgl.UNSIGNED_SHORT,
		null
	);
	ERgl.texParameteri(ERgl.TEXTURE_2D, ERgl.TEXTURE_MIN_FILTER, ERgl.NEAREST);
	ERgl.texParameteri(ERgl.TEXTURE_2D, ERgl.TEXTURE_MAG_FILTER, ERgl.NEAREST);
	ERgl.texParameteri(ERgl.TEXTURE_2D, ERgl.TEXTURE_WRAP_S, ERgl.REPEAT);
	ERgl.texParameteri(ERgl.TEXTURE_2D, ERgl.TEXTURE_WRAP_T, ERgl.REPEAT);

	ERgl.bindFramebuffer(ERgl.FRAMEBUFFER, framebuffer);
	ERgl.framebufferTexture2D(
		ERgl.FRAMEBUFFER,
		ERgl.DEPTH_ATTACHMENT,
		ERgl.TEXTURE_2D,
		texture,
		0
	);
	ERgl.bindFramebuffer(ERgl.FRAMEBUFFER, null);

	const matrix = createLightSpaceMatrix();
	const shader = createShadowMapShader();

	ERShadowMap = { framebuffer, texture, matrix, shader };
}

function createLightSpaceMatrix() {
	const near = 1;
	const far = 100;
	const proj = mat4.ortho(mat4.create(), -50, 50, -50, 50, near, far);
	const lightView = mat4.lookAt(
		mat4.create(),
		vec3.fromValues(1, 50, 1),
		vec3.fromValues(0, 0, 0),
		vec3.fromValues(0, 1, 0)
	);
	const lightSpaceMatrix = mat4.mul(mat4.create(), proj, lightView);
	return lightSpaceMatrix;
}

function bindShadowMap() {
	ERgl.bindFramebuffer(ERgl.FRAMEBUFFER, ERShadowMap.framebuffer);
	ERgl.clear(ERgl.DEPTH_BUFFER_BIT);
	ERgl.viewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
}

function drawToShadowMap() {
	bindShadowMap();
	drawShadows();
	unbindShadowMap();
}

function drawShadows() {
	ERgl.useProgram(ERShadowMap.shader.program);
	ERgl.uniformMatrix4fv(
		ERShadowMap.shader.uniformLocations.lightSpaceMatrix,
		false,
		ERShadowMap.matrix
	);
	for (const obj of ERObjects) {
		const { position, rotation, scale } = obj;
		ERgl.uniformMatrix4fv(
			ERShadowMap.shader.uniformLocations.model,
			false,
			createModelMatrix(position, rotation, scale)
		);
		drawObjectShadow(obj);
	}
}

function drawObjectShadow(obj) {
	ERgl.bindBuffer(ERgl.ARRAY_BUFFER, obj.model.buffers.posBuff);
	ERgl.vertexAttribPointer(
		ERShadowMap.shader.attribLocations.aPosition,
		3,
		ERgl.FLOAT,
		false,
		0,
		0
	);
	ERgl.enableVertexAttribArray(ERShadowMap.shader.attribLocations.aPosition);

	ERgl.bindBuffer(ERgl.ELEMENT_ARRAY_BUFFER, obj.model.buffers.indexBuff);

	ERgl.drawElements(
		ERgl.TRIANGLES,
		obj.model.numPositions,
		ERgl.UNSIGNED_SHORT,
		0
	);
}

function unbindShadowMap() {
	ERgl.bindFramebuffer(ERgl.FRAMEBUFFER, null);
	ERgl.clear(ERgl.DEPTH_BUFFER_BIT | ERgl.COLOR_BUFFER_BIT);
	ERgl.viewport(0, 0, ERgl.canvas.clientWidth, ERgl.canvas.clientHeight);
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

function createShadowMapShader() {
	const vSource = `
	attribute vec3 aPosition;

	uniform mat4 lightSpaceMatrix;
	uniform mat4 model;

	void main(){
		gl_Position = lightSpaceMatrix * model * vec4(aPosition, 1.0);
	}`;
	const fSource = `

	void main(){
		
	}`;

	const program = createShaderProgram(vSource, fSource);
	return {
		program,
		attribLocations: {
			aPosition: ERgl.getAttribLocation(program, "aPosition"),
		},
		uniformLocations: {
			lightSpaceMatrix: ERgl.getUniformLocation(program, "lightSpaceMatrix"),
			model: ERgl.getUniformLocation(program, "model"),
		},
	};
}

function createModelShader() {
	const vSource = `
	attribute vec3 aPosition;
	attribute vec3 aNormal;
	attribute vec2 aUV;

	varying vec3 vNormal;
	varying vec3 vLightDir;
	varying vec2 vUV;
	varying vec3 vToCamVec;
	varying vec3 vFragPos;
	varying vec4 vFragPosLightSpace;

	uniform mat4 projection;
	uniform mat4 view;
	uniform mat4 model;
	uniform vec3 camPos;
	uniform mat4 lightSpaceMatrix;

	const vec3 lightDir = vec3(0.0, -1.0, -1.0);

	void main(){
		vec4 worldPos = model * vec4(aPosition, 1.0);
		gl_Position = projection * view * worldPos;

		vFragPos = worldPos.xyz;
		vFragPosLightSpace = lightSpaceMatrix * vec4(vFragPos, 1.0);

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
	varying mediump vec3 vFragPos;
	varying mediump vec4 vFragPosLightSpace;

	uniform mediump vec3 objColor;
	uniform sampler2D uTexture;
	uniform sampler2D shadowMap;
	uniform int textured;

	const mediump float shininess = 2.0;
	const mediump float reflectivity = 0.3;

	mediump float ShadowCalculation(mediump vec4 fragPosLightSpace){
		// perform perspective divide
		mediump vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

		// transform to [0,1] range
		projCoords = projCoords * 0.5 + 0.5;

		// get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
		mediump float closestDepth = texture2D(shadowMap, projCoords.xy).r;

		// get depth of current fragment from light's perspective
		mediump float currentDepth = projCoords.z;

		// check whether current frag pos is in shadow
		mediump float shadow = currentDepth > closestDepth ? 0.0 : 1.0;

		return shadow;
	}

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

		// Shadow
		mediump float shadow = ShadowCalculation(vFragPosLightSpace);

		gl_FragColor = vec4(fragColor * shadow + finalSpec * shadow, 1.0);
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
			shadowMap: ERgl.getUniformLocation(program, "shadowMap"),
			lightSpaceMatrix: ERgl.getUniformLocation(program, "lightSpaceMatrix"),
		},
	};
	ERgl.useProgram(program);
	ERgl.uniform1i(ERModelShader.uniformLocations.uTexture, 0);
	ERgl.uniform1i(ERModelShader.uniformLocations.shadowMap, 1);
}
