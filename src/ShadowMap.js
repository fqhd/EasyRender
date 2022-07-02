import Framebuffer from "./Framebuffer.js";
import ERMath from "./ERMath.js";

class ShadowMap {
	constructor(gl) {
		this.shadowMaps = [];
		this.shadowMaps.push(new Framebuffer(gl, 1024));
		const WVP = ERMath.calcLightSpaceMatrix(0, -30, {
			x: 0,
			y: 10,
			z: -10,
		});
	}
	bind() {
		this.shadowMaps[0].bind();
	}
	unbind() {
		this.shadowMaps[0].unbind();
	}
}

export default ShadowMap;
