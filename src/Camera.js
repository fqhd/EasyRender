import ERMath from "./ERMath.js";

class Camera {
	constructor(width, height, fov) {
		this.width = width;
		this.height = height;
		this.fov = fov;
		this.pitch = -41;
		this.yaw = 0;
		this.position = {
			x: 0,
			y: 0,
			z: 0,
		};
	}

	getView() {
		return ERMath.calcProj(this.width, this.height, this.fov);
	}

	getProj() {
		return ERMath.calcView(this.yaw, this.pitch, this.position);
	}
}

export default Camera;
