class Framebuffer {
	private _framebufferID: any;
	private _textureID: any;

	constructor(private _gl: WebGLRenderingContext, private _width: number) {
		this._framebufferID = _gl.createFramebuffer();
		this._textureID = _gl.createTexture();

		_gl.bindTexture(_gl.TEXTURE_2D, this._textureID);
		_gl.texImage2D(
			_gl.TEXTURE_2D,
			0,
			_gl.DEPTH_COMPONENT,
			_width,
			_width,
			0,
			_gl.DEPTH_COMPONENT,
			_gl.UNSIGNED_SHORT,
			null
		);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.REPEAT);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.REPEAT);

		_gl.bindFramebuffer(_gl.FRAMEBUFFER, this._framebufferID);
		_gl.framebufferTexture2D(
			_gl.FRAMEBUFFER,
			_gl.DEPTH_ATTACHMENT,
			_gl.TEXTURE_2D,
			this._textureID,
			0
		);
		_gl.bindFramebuffer(_gl.FRAMEBUFFER, null);
	}

	public bind() {
		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._framebufferID);
		this._gl.clear(this._gl.DEPTH_BUFFER_BIT);
		this._gl.viewport(0, 0, this._width, this._width);
		this._gl.cullFace(this._gl.FRONT);
	}

	public unbind() {
		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
		this._gl.clear(this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT);
		this._gl.viewport(0, 0, this._gl.canvas.clientWidth, this._gl.canvas.clientHeight);
		this._gl.cullFace(this._gl.BACK);
	}
}

export default Framebuffer;