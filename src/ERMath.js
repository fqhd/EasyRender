const { vec3, mat4 } = glMatrix;
class ERMath {
	static calcForward(pitch, yaw) {
		return vec3.fromValues(
			Math.cos(ERMath.toRadians(yaw)) * Math.cos(ERMath.toRadians(pitch)),
			Math.sin(ERMath.toRadians(pitch)),
			Math.sin(ERMath.toRadians(yaw)) * Math.cos(ERMath.toRadians(pitch))
		);
	}

	static toRadians(r) {
		return (r * Math.PI) / 180;
	}

	static createModelMatrix(position, rotation, scale) {
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

	static isPowerOf2(value) {
		return (value & (value - 1)) == 0;
	}

	static calcProj(w, h, fov) {
		const proj = mat4.create();
		mat4.perspective(proj, ERMath.toRadians(fov), w / h, 0.1, 1000);
		return proj;
	}

	static calcView(yaw, pitch, position) {
		const view = mat4.create();
		const camPosVec = vec3.fromValues(0, 0, -10);
		// const camForwardVec = ERMath.calcForward(pitch, yaw);
		const camForwardVec = vec3.fromValues(0, 0, 1);
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
