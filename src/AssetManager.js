import TextureManager from "./TextureManager.js";

class AssetManager {
	constructor(gl) {
		// Initialize default albedo, normal, and specular textures
		this.gl = gl;
		this.textureManager = new TextureManager(gl);
		this.albedo = this.textureManager.createTexture([255, 255, 255]);
		this.normal = this.textureManager.createTexture([0, 255, 0]);
		this.specular = this.textureManager.createTexture([0, 0, 0]);
	}

	async getTexture(albedoURL, normalURL, specularURL) {
		let albedo;
		if (albedoURL) {
			albedo = await this.textureManager.loadWebGLTexture(albedoURL);
		} else {
			albedo = this.albedo;
		}

		let normal;
		if (normalURL) {
			normal = await this.textureManager.loadWebGLTexture(normalURL);
		} else {
			normal = this.normal;
		}

		let specular;
		if (specularURL) {
			specular = await this.textureManager.loadWebGLTexture(specularURL);
		} else {
			specular = this.specular;
		}

		return {
			albedo,
			normal,
			specular,
		};
	}
}

export default AssetManager;
