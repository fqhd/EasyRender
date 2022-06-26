import ERMath from "./ERMath";

class TextureManager {
	private _cache: Map<URL, WebGLTexture>;

	constructor(private _gl: WebGLRenderingContext) {}
	public async getTexture(url: URL) {
		const query = this._cache.get(url);
		if (query) {
			return query;
		}
		const texture = await this.loadWebGLTexture(url);
		this._cache.set(url, texture);
		return texture;
	}

	private loadWebGLTexture(url: URL): Promise<WebGLTexture> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.src = url.toString();
			image.onload = () => {
				const texture = this._gl.createTexture();
				this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
				this._gl.texImage2D(
					this._gl.TEXTURE_2D,
					0,
					this._gl.RGBA,
					this._gl.RGBA,
					this._gl.UNSIGNED_BYTE,
					image
				);
				if (ERMath.isPowerOf2(image.width) && ERMath.isPowerOf2(image.height)) {
					this._gl.generateMipmap(this._gl.TEXTURE_2D);
				} else {
					this._gl.texParameteri(
						this._gl.TEXTURE_2D,
						this._gl.TEXTURE_WRAP_S,
						this._gl.CLAMP_TO_EDGE
					);
					this._gl.texParameteri(
						this._gl.TEXTURE_2D,
						this._gl.TEXTURE_WRAP_T,
						this._gl.CLAMP_TO_EDGE
					);
					this._gl.texParameteri(
						this._gl.TEXTURE_2D,
						this._gl.TEXTURE_MIN_FILTER,
						this._gl.LINEAR
					);
				}
				if(texture){
					resolve(texture);
				}
			};
			image.onabort = function () {
				reject("ERLoadTexture: failed to load texture: " + url);
			};
		});
	}

	public createTexture(data: number[]) {
		const width = Math.sqrt(data.length / 3);
		const texture = this._gl.createTexture();
		this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
		this._gl.texImage2D(
			this._gl.TEXTURE_2D,
			0,
			this._gl.RGBA,
			this._gl.RGBA,
			this._gl.UNSIGNED_BYTE,
			0,
			this._gl.RGB,
			this._gl.UNSIGNED_BYTE,
			new Uint8Array(data)
		);
		if (ERMath.isPowerOf2(width)) {
			this._gl.generateMipmap(this._gl.TEXTURE_2D);
		} else {
			this._gl.texParameteri(
				this._gl.TEXTURE_2D,
				this._gl.TEXTURE_WRAP_S,
				this._gl.CLAMP_TO_EDGE
			);
			this._gl.texParameteri(
				this._gl.TEXTURE_2D,
				this._gl.TEXTURE_WRAP_T,
				this._gl.CLAMP_TO_EDGE
			);
			this._gl.texParameteri(
				this._gl.TEXTURE_2D,
				this._gl.TEXTURE_MIN_FILTER,
				this._gl.LINEAR
			);
		}
		return texture;
	}
}

export default TextureManager;
