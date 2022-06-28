class Framebuffer {
	constructor(gl, width) {
		this.width = width;
		this.gl = gl;
		this.framebufferID = gl.createFramebuffer();
		this.textureID = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, this.textureID);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.DEPTH_COMPONENT,
			width,
			width,
			0,
			gl.DEPTH_COMPONENT,
			gl.UNSIGNED_SHORT,
			null
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferID);
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.DEPTH_ATTACHMENT,
			gl.TEXTURE_2D,
			this.textureID,
			0
		);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	bind() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebufferID);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
		this.gl.viewport(0, 0, this.width, this.width);
		this.gl.cullFace(this.gl.FRONT);
	}

	unbind() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
		this.gl.viewport(
			0,
			0,
			this.gl.canvas.clientWidth,
			this.gl.canvas.clientHeight
		);
		this.gl.cullFace(this.gl.BACK);
	}
}

export default Framebuffer;
