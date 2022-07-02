import loadDebugShader from "./DebugShader.js";

class DebugSquare {
	constructor(gl) {
		this.gl = gl;

		this.posBuff = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuff);
		const data = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1];
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(data),
			this.gl.STATIC_DRAW
		);
	}

	async loadShaders(gl){
		this.shader = await loadDebugShader(gl);
	}

	draw(texture) {
		this.shader.bind();
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuff);
		this.gl.vertexAttribPointer(
			this.shader.getAttribLocation("aPosition"),
			2,
			this.gl.FLOAT,
			false,
			0,
			0
		);
		this.gl.enableVertexAttribArray(this.shader.getAttribLocation("aPosition"));
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	}
}

export default DebugSquare;
