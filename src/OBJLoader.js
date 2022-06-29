class OBJLoader {
	constructor(gl) {
		this.gl = gl;
	}

	async loadModel(url) {
		const data = await this.loadModelData(url);
		const optimizedData = this.optimizeModel(data);
		const { positions, normals, textureCoords, indices } = optimizedData;
		const model = this.createModel(positions, normals, textureCoords, indices);
		return model;
	}

	async loadModelData(url) {
		const response = await fetch(url);
		const text = await response.text();
		const lines = text.split("\n");
		const positions_lookup = new Array();
		const normals_lookup = new Array();
		const uvs_lookup = new Array();
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

		const positions = new Array();
		const normals = new Array();
		const textureCoords = new Array();

		for (let i = 0; i < lines.length; i++) {
			let tokens = lines[i].split(" ");
			if (tokens[0] == "f") {
				for (let j = 1; j < 4; j++) {
					const curr_token_indices = tokens[j]
						.split("/")
						.map((t) => parseInt(t));

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

	removeVertex(data, i) {
		data.positions.splice(i * 3, 3);
		data.textureCoords.splice(i * 2, 2);
		data.normals.splice(i * 3, 3);
	}

	optimizeModel(data) {
		const indices = new Array();
		for (let i = 0; i < data.positions.length / 3; i++) {
			const v = this.isVertexProcessed(data, i);
			if (v.processed) {
				indices.push(v.i);
				this.removeVertex(data, i);
				i--; // This is important please don't remove it
			} else {
				indices.push(i);
			}
		}
		return {
			positions: data.positions,
			normals: data.normals,
			textureCoords: data.textureCoords,
			indices,
		};
	}

	getVertex(data, index) {
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

	isVertexProcessed(data, index) {
		const v1 = this.getVertex(data, index);
		for (let i = 0; i < index; i++) {
			const v2 = this.getVertex(data, i);
			if (this.areVerticesIdentical(v1, v2)) {
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

	areVerticesIdentical(v1, v2) {
		for (let i = 0; i < v1.length; i++) {
			if (v1[i] != v2[i]) {
				return false;
			}
		}
		return true;
	}

	createModel(positions, normals, indices, textureCoords) {
		this.checkIndices(indices);
		const posBuff = this.gl.createBuffer();
		const normBuff = this.gl.createBuffer();
		const uvBuff = this.gl.createBuffer();
		const indexBuff = this.gl.createBuffer();

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuff);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(positions),
			this.gl.STATIC_DRAW
		);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normBuff);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(normals),
			this.gl.STATIC_DRAW
		);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuff);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(textureCoords),
			this.gl.STATIC_DRAW
		);

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuff);
		this.gl.bufferData(
			this.gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(indices),
			this.gl.STATIC_DRAW
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

	checkIndices(indices) {
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
}

export default OBJLoader;
