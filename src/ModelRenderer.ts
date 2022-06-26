import ModelShader from "./ModelShader";
import ShadowShader from "./ShadowShader";
import { ERModel } from "./types";
import { ERTexture } from "./types";

class ModelRenderer {
	public shader: ModelShader;
	public shadowShader: ShadowShader;

	constructor(private _gl: WebGLRenderingContext) {
		this.shader = new ModelShader(_gl);
		this.shadowShader = new ShadowShader(_gl);
	}

	public bindTexture(texture: ERTexture){
		this._gl.activeTexture(this._gl.TEXTURE0);
		this._gl.bindTexture(this._gl.TEXTURE_2D, texture.albedo);

		this._gl.activeTexture(this._gl.TEXTURE1);
		this._gl.bindTexture(this._gl.TEXTURE_2D, texture.normal);

		this._gl.activeTexture(this._gl.TEXTURE2);
		this._gl.bindTexture(this._gl.TEXTURE_2D, texture.specular);
	}

	public drawModel(model: ERModel) {
		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, model.buffers.posBuff);
		this._gl.vertexAttribPointer(
			this.shader.getAttribLocation("aPosition"),
			3,
			this._gl.FLOAT,
			false,
			0,
			0
		);
		this._gl.enableVertexAttribArray(
			this.shader.getAttribLocation("aPosition")
		);

		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, model.buffers.normBuff);
		this._gl.vertexAttribPointer(
			this.shader.getAttribLocation("aNormal"),
			3,
			this._gl.FLOAT,
			false,
			0,
			0
		);
		this._gl.enableVertexAttribArray(this.shader.getAttribLocation("aNormal"));

		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, model.buffers.uvBuff);
		this._gl.vertexAttribPointer(
			this.shader.getAttribLocation("aUV"),
			2,
			this._gl.FLOAT,
			false,
			0,
			0
		);
		this._gl.enableVertexAttribArray(this.shader.getAttribLocation("aUV"));

		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, model.buffers.indexBuff);

		this._gl.drawElements(
			this._gl.TRIANGLES,
			model.numPositions,
			this._gl.UNSIGNED_SHORT,
			0
		);
	}

	public drawModelShadow(model: ERModel) {
		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, model.buffers.posBuff);
		this._gl.vertexAttribPointer(
			this.shader.getAttribLocation("aPosition"),
			3,
			this._gl.FLOAT,
			false,
			0,
			0
		);
		this._gl.enableVertexAttribArray(
			this.shader.getAttribLocation("aPosition")
		);

		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, model.buffers.indexBuff);

		this._gl.drawElements(
			this._gl.TRIANGLES,
			model.numPositions,
			this._gl.UNSIGNED_SHORT,
			0
		);
	}
}

export default ModelRenderer;
