import TextureManager from "./TextureManager.js";

class AssetManager {
	constructor(gl){
		// Initialize default albedo, normal, and specular textures
		this.gl = gl;
		this.textureManager = new TextureManager(gl);
		this.albedo = this.textureManager.createTexture([255, 255, 255]);
		this.normal = this.textureManager.createTexture([0, 255, 0]);
		this.specular = this.textureManager.createTexture([0, 0, 0]);
	}

	async getTexture(albedoURL, normalURL, specularURL) {
			let albedo = await this.textureManager.getTexture(albedoURL);
			if(!albedo){
				albedo = this.albedo;
			}

			let normal = await this.textureManager.getTexture(normalURL);
			if(!normal){
				normal = this.normal;
			}

			let specular = await this.textureManager.getTexture(specularURL);
			if(!specular){
				specular = this.specular;
			}

			return {
				albedo,
				normal,
				specular
			};
	}
}

export default AssetManager;