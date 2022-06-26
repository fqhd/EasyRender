import ERMath from "./ERMath";
import { Vector } from "./types";

class Camera {
	private pitch: number;
	private yaw: number;
	private position: Vector;

	constructor(
		private _width: number,
		private _height: number,
		public fov: number
	) {
		this.pitch = -41;
		this.yaw = 0;
		this.position = {
			x: 0,
			y: 0,
			z: 0,
		};
	}

	public getView() {
		return ERMath.calcProj(this._width, this._height, this.fov);
	}

	public getProj() {
		return ERMath.calcView(this.yaw, this.pitch, this.position);
	}
}

export default Camera;
