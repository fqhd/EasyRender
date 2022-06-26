import TextureManager from "./TextureManager";

class AssetManager {
	private _albedo: any; // Default albedo texture
	private _normal: any; // Default normal texture
	private _specular: any; // Default specular texture
	private _textureManager: TextureManager;

	constructor(gl: WebGLRenderingContext){
		// Initialize default albedo, normal, and specular textures
		this._textureManager = new TextureManager(gl);
		this._albedo = this._textureManager.createTexture([255, 255, 255]);
		this._normal = this._textureManager.createTexture([0, 255, 0]);
		this._specular = this._textureManager.createTexture([0, 0, 0]);
	}

	public async getTexture(albedoURL: URL, normalURL: URL, specularURL: URL) {
			let albedo = await this._textureManager.getTexture(albedoURL);
			if(!albedo){
				albedo = this._albedo;
			}

			let normal = await this._textureManager.getTexture(normalURL);
			if(!normal){
				normal = this._normal;
			}

			let specular = await this._textureManager.getTexture(specularURL);
			if(!specular){
				specular = this._specular;
			}

			return {
				albedo,
				normal,
				specular
			};
	}
}

export default AssetManager;