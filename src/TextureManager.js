import ERMath from "./ERMath.js";

class TextureManager {
	constructor(gl) {
		this.gl = gl;
	}

	loadWebGLTexture(url) {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.src = url;
			image.onload = () => {
				const texture = this.gl.createTexture();
				this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
				this.gl.texImage2D(
					this.gl.TEXTURE_2D,
					0,
					this.gl.RGB,
					this.gl.RGB,
					this.gl.UNSIGNED_BYTE,
					image
				);
				if (ERMath.isPowerOf2(image.width) && ERMath.isPowerOf2(image.height)) {
					this.gl.generateMipmap(this.gl.TEXTURE_2D);
				} else {
					this.gl.texParameteri(
						this.gl.TEXTURE_2D,
						this.gl.TEXTURE_WRAP_S,
						this.gl.CLAMP_TO_EDGE
					);
					this.gl.texParameteri(
						this.gl.TEXTURE_2D,
						this.gl.TEXTURE_WRAP_T,
						this.gl.CLAMP_TO_EDGE
					);
					this.gl.texParameteri(
						this.gl.TEXTURE_2D,
						this.gl.TEXTURE_MIN_FILTER,
						this.gl.LINEAR
					);
				}
				resolve(texture);
			};
		});
	}

	createTexture(data) {
		const width = Math.sqrt(data.length / 3);
		const texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGB,
			width,
			width,
			0,
			this.gl.RGB,
			this.gl.UNSIGNED_BYTE,
			new Uint8Array(data)
		);
		if (ERMath.isPowerOf2(width)) {
			this.gl.generateMipmap(this.gl.TEXTURE_2D);
		} else {
			this.gl.texParameteri(
				this.gl.TEXTURE_2D,
				this.gl.TEXTURE_WRAP_S,
				this.gl.CLAMP_TO_EDGE
			);
			this.gl.texParameteri(
				this.gl.TEXTURE_2D,
				this.gl.TEXTURE_WRAP_T,
				this.gl.CLAMP_TO_EDGE
			);
			this.gl.texParameteri(
				this.gl.TEXTURE_2D,
				this.gl.TEXTURE_MIN_FILTER,
				this.gl.LINEAR
			);
		}
		return texture;
	}
}

export default TextureManager;
