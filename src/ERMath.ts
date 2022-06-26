import { vec3, mat4 } from "gl-matrix";
import { Vector } from "./types";

class ERMath {
	public static calcForward(pitch: number, yaw: number) {
		return vec3.fromValues(
			Math.sin(ERMath.toRadians(yaw)) * Math.cos(ERMath.toRadians(pitch)),
			Math.sin(ERMath.toRadians(pitch)),
			Math.cos(ERMath.toRadians(yaw)) * Math.cos(ERMath.toRadians(pitch))
		);
	}

	public static toRadians(r: number) {
		return (r * Math.PI) / 180;
	}

	public static createModelMatrix(position: Vector, rotation: Vector, scale: Vector) {
		const matrix = mat4.create();
		mat4.fromTranslation(matrix, [position.x, position.y, position.z]);
		mat4.rotate(
			matrix,
			matrix,
			ERMath.toRadians(rotation.x),
			vec3.fromValues(1, 0, 0)
		);
		mat4.rotate(
			matrix,
			matrix,
			ERMath.toRadians(rotation.y),
			vec3.fromValues(0, 1, 0)
		);
		mat4.rotate(
			matrix,
			matrix,
			ERMath.toRadians(rotation.z),
			vec3.fromValues(0, 0, 1)
		);
		mat4.scale(matrix, matrix, [scale.x, scale.y, scale.z]);
		return matrix;
	}

	public static isPowerOf2(value: number) {
		return (value & (value - 1)) == 0;
	}

	public static calcProj(w: number, h: number, fov: number) {
		const proj = mat4.create();
		mat4.perspective(proj, ERMath.toRadians(fov), w / h, 0.1, 1000.0);
		return proj;
	}

	public static calcView(yaw: number, pitch: number, position: Vector) {
		const view = mat4.create();
		const camPosVec = vec3.fromValues(position.x, position.y, position.z);
		const camForwardVec = ERMath.calcForward(pitch, yaw);
		mat4.lookAt(
			view,
			camPosVec,
			vec3.add(vec3.create(), camPosVec, camForwardVec),
			vec3.fromValues(0, 1, 0)
		);
		return view;
	}
}

export default ERMath;
