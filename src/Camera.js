import ERMath from "./ERMath.js";

class Camera {
	constructor(width, height, fov) {
		this.width = width;
		this.height = height;
		this.fov = fov;
		this.pitch = 0;
		this.yaw = 0;
		this.position = {
			x: 0,
			y: 0,
			z: 0,
		};
	}

	getView() {
		return ERMath.calcView(this.yaw, this.pitch, this.position);
	}
	
	getProj() {
		return ERMath.calcProj(this.width, this.height, this.fov);
	}
}

export default Camera;
