import ModelRenderer from "./ModelRenderer";
import OBJLoader from "./OBJLoader";
import Framebuffer from "./Framebuffer";
import Camera from "./Camera";
import { ERObject, ERModel, ERTexture } from "./types";
import AssetManager from "./AssetManager";
import ERMath from "./ERMath";

class EasyRender {
	private _shadowMap: Framebuffer;
	private _callback: Function;
	private _renderer: ModelRenderer;
	private _objects: ERObject[];
	public assetmanager: AssetManager;
	public objloader: OBJLoader;
	public camera: Camera;

	constructor(id: string) {
		const canvas: any = document.getElementById(id);
		if (!canvas) {
			console.log("EasyRender: No canvas with id " + id + " found.");
		}
		const gl = canvas.getContext("webgl");
		this._renderer = new ModelRenderer(gl);
		this._shadowMap = new Framebuffer(gl, 2048);
		this.objloader = new OBJLoader(gl);
		this.assetmanager = new AssetManager(gl);
		this.camera = new Camera(canvas.clientWidth, canvas.clientHeight, 70);
	}

	public add(obj: ERObject){
		this._objects.push(obj);
	}

	public createObject(model: ERModel, texture: ERTexture) {
		return {
			model,
			texture,
			position: {
				x: 0,
				y: 0,
				z: 0,
			},
			rotation: {
				x: 0,
				y: 0,
				z: 0,
			},
			scale: {
				x: 1,
				y: 1,
				z: 1,
			},
		};
	}

	private drawShadows() {
		this._shadowMap.bind();
		this._renderer.shadowShader.bind();
		for (const object of this._objects) {
			const { position, rotation, scale } = object;
			const modelMatrix = ERMath.createModelMatrix(position, rotation, scale);
			this._renderer.shader.setMat4("model", modelMatrix);
			this._renderer.drawModelShadow(object.model);
		}
		this._shadowMap.unbind();
	}

	private drawObjects() {
		this._renderer.shader.bind();
		this._renderer.shader.setMat4("view", this.camera.getView());
		this._renderer.shader.setMat4("proj", this.camera.getProj());

		for (const object of this._objects) {
			const { position, rotation, scale } = object;
			const modelMatrix = ERMath.createModelMatrix(position, rotation, scale);
			this._renderer.shader.setMat4("model", modelMatrix);
			this._renderer.bindTexture(object.texture);
			this._renderer.drawModel(object.model);
		}
	}

	public beginRenderLoop(callback: Function) {
		this._callback = callback;
		this.animate(0);
	}

	private animate(time: number) {
		this._callback();
		this.drawScene();
		requestAnimationFrame(this.animate);
	}

	public drawScene() {
		this.drawToShadowMap();
		this.drawObjects();
	}

	private drawToShadowMap() {
		this._shadowMap.bind();
		this.drawShadows();
		this._shadowMap.unbind();
	}
}

export default EasyRender;
