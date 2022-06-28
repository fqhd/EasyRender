import ModelShader from "./ModelShader.js";
import ShadowShader from "./ShadowMapShader.js";

class ModelRenderer {
	constructor(gl) {
		this.gl = gl;
		this.modelShader = new ModelShader(gl);
		this.shadowShader = new ShadowShader(gl);
	}

	bindTexture(texture){
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.albedo);

		this.gl.activeTexture(this.gl.TEXTURE1);
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.normal);

		this.gl.activeTexture(this.gl.TEXTURE2);
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.specular);
	}

	drawModel(model) {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, model.buffers.posBuff);
		this.gl.vertexAttribPointer(
			this.shader.getAttribLocation("aPosition"),
			3,
			this.gl.FLOAT,
			false,
			0,
			0
		);
		this.gl.enableVertexAttribArray(
			this.shader.getAttribLocation("aPosition")
		);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, model.buffers.normBuff);
		this.gl.vertexAttribPointer(
			this.shader.getAttribLocation("aNormal"),
			3,
			this.gl.FLOAT,
			false,
			0,
			0
		);
		this.gl.enableVertexAttribArray(this.shader.getAttribLocation("aNormal"));

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, model.buffers.uvBuff);
		this.gl.vertexAttribPointer(
			this.shader.getAttribLocation("aUV"),
			2,
			this.gl.FLOAT,
			false,
			0,
			0
		);
		this.gl.enableVertexAttribArray(this.shader.getAttribLocation("aUV"));

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, model.buffers.indexBuff);

		this.gl.drawElements(
			this.gl.TRIANGLES,
			model.numPositions,
			this.gl.UNSIGNED_SHORT,
			0
		);
	}

	drawModelShadow(model) {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, model.buffers.posBuff);
		this.gl.vertexAttribPointer(
			this.shader.getAttribLocation("aPosition"),
			3,
			this.gl.FLOAT,
			false,
			0,
			0
		);
		this.gl.enableVertexAttribArray(
			this.shader.getAttribLocation("aPosition")
		);

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, model.buffers.indexBuff);

		this.gl.drawElements(
			this.gl.TRIANGLES,
			model.numPositions,
			this.gl.UNSIGNED_SHORT,
			0
		);
	}
}

export default ModelRenderer;
