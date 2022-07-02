import ModelRenderer from "./ModelRenderer.js";
import OBJLoader from "./OBJLoader.js";
import Camera from "./Camera.js";
import TextureManager from "./TextureManager.js";
import ERMath from "./ERMath.js";
import ShadowMap from "./ShadowMap.js";
import DebugSquare from "./DebugSquare.js";

class EasyRender {
	constructor(id) {
		const canvas = document.getElementById(id);
		this.initWebGL(canvas);
		this.renderer = new ModelRenderer(this.gl);
		this.shadowMap = new ShadowMap(this.gl);
		this.objloader = new OBJLoader(this.gl);
		this.textureManager = new TextureManager(this.gl);
		this.camera = new Camera(canvas.clientWidth, canvas.clientHeight, 70);
		this.objects = [];
		this.debugSquare = new DebugSquare(this.gl);
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

	async loadShaders(gl){
		await this.renderer.loadShaders(gl);
		await this.debugSquare.loadShaders(gl);
	}

	async loadObject(path) {
		// Load everything
		const albedo = await this.textureManager.loadTexture(path, "albedo");
		const model = await this.objloader.loadModel(path);
		return this.createObject(model, {
			albedo,
		});
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
		this.renderer.shadowShader.bind();
		this.renderer.shadowShader.setMat4("gWVP", ERMath.calcLightSpaceMatrix(this.camera.yaw, this.camera.pitch, this.camera.position));
		for (const object of this.objects) {
			this.renderer.drawModelShadow(object.model);
		}
	}

	drawObjects() {
		this.renderer.modelShader.bind();
		this.renderer.modelShader.setMat4("view", this.camera.getView());
		this.renderer.modelShader.setMat4("projection", this.camera.getProj());

		for (const object of this.objects) {
			const { position, rotation, scale } = object;
			const modelMatrix = ERMath.createModelMatrix(position, rotation, scale);
			this.renderer.modelShader.setMat4("model", modelMatrix);
			this.renderer.bindTexture(object.texture);
			this.renderer.drawModel(object.model);
		}
	}

	drawScene() {
		this.drawToShadowMap();
		this.drawObjects();
		this.debugSquare.draw(this.shadowMap.shadowMaps[0].textureID);
	}

	drawToShadowMap() {
		this.shadowMap.bind();
		this.drawShadows();
		this.shadowMap.unbind();
	}
}

export default EasyRender;
