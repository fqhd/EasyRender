import ModelRenderer from "./ModelRenderer.js";
import OBJLoader from "./OBJLoader.js";
import Framebuffer from "./Framebuffer.js";
import Camera from "./Camera.js";
import AssetManager from "./AssetManager.js";
import ERMath from "./ERMath.js";

class EasyRender {
	constructor(id) {
		const canvas = document.getElementById(id);
		this.initWebGL(canvas);
		this.renderer = new ModelRenderer(this.gl);
		// this.shadowMap = new Framebuffer(this.gl, 2048);
		this.objloader = new OBJLoader(this.gl);
		// this.assetmanager = new AssetManager(this.gl);
		this.camera = new Camera(canvas.clientWidth, canvas.clientHeight, 70);
		this.objects = [];
	}

	initWebGL(canvas) {
		if (!canvas) {
			console.log("EasyRender: No canvas with id " + id + " found.");
		}
		const gl = canvas.getContext("webgl");
		gl.clearColor(0.7, 0.81, 1, 1);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		// gl.enable(gl.CULL_FACE);
		if (!gl.getExtension("WEBGL_depth_texture")) {
			alert(
				"Your browser doesn't support the WEBGL_depth_texture extension. This application may not work"
			);
			console.log("Missing Extension: WEBGL_depth_texture");
		}
		this.gl = gl;
	}

	add(obj) {
		this.objects.push(obj);
	}

	createObject(model, texture) {
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

	drawShadows() {
		this.shadowMap.bind();
		this.renderer.shadowShader.bind();
		for (const object of this.objects) {
			const { position, rotation, scale } = object;
			const modelMatrix = ERMath.createModelMatrix(position, rotation, scale);
			this.renderer.shadowShader.setMat4("model", modelMatrix);
			this.renderer.drawModelShadow(object.model);
		}
		this.shadowMap.unbind();
	}

	drawObjects() {
		this.renderer.modelShader.bind();
		this.renderer.modelShader.setMat4("view", this.camera.getView());
		this.renderer.modelShader.setMat4("projection", this.camera.getProj());

		for (const object of this.objects) {
			const { position, rotation, scale } = object;
			const modelMatrix = ERMath.createModelMatrix(position, rotation, scale);
			this.renderer.modelShader.setMat4("model", modelMatrix);
			// this.renderer.bindTexture(object.texture);
			this.renderer.drawModel(object.model);
		}
	}

	drawScene() {
		this.clear();
		// this.drawToShadowMap();
		this.drawObjects();
	}

	clear() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.gl.viewport(
			0,
			0,
			this.gl.canvas.clientWidth,
			this.gl.canvas.clientHeight
		);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
	}

	drawToShadowMap() {
		this.shadowMap.bind();
		this.drawShadows();
		this.shadowMap.unbind();
	}
}

export default EasyRender;
