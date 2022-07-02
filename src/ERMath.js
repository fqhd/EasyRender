const { vec3, vec4, mat4 } = glMatrix;

class ERMath {
	static calcForward(pitch, yaw) {
		return vec3.fromValues(
			Math.sin(ERMath.toRadians(yaw)) * Math.cos(ERMath.toRadians(pitch)),
			Math.sin(ERMath.toRadians(pitch)),
			Math.cos(ERMath.toRadians(yaw)) * Math.cos(ERMath.toRadians(pitch))
		);
	}

	static toRadians(r) {
		return (r * Math.PI) / 180;
	}

	static mulMatVec(mat, vec){
		return vec4.fromValues(
			mat[0] * vec[0] + mat[4] * vec[0] + mat[8] * vec[0] + mat[12] * vec[0],
			mat[1] * vec[1] + mat[5] * vec[1] + mat[9] * vec[1] + mat[13] * vec[1],
			mat[2] * vec[2] + mat[6] * vec[2] + mat[10] * vec[2] + mat[14] * vec[2],
			mat[3] * vec[3] + mat[7] * vec[3] + mat[11] * vec[3] + mat[15] * vec[3],
		);
	}

	static calcLightSpaceMatrix(yaw, pitch, position) {
		const view = ERMath.calcView(yaw, pitch, position);
		const CamInv = mat4.invert(mat4.create(), view);
		
		const LightM = mat4.lookAt(
			mat4.create(),
			vec3.fromValues(0, 0, 0),
			vec3.fromValues(0, -1, -1),
			vec3.fromValues(0, 1, 0)
		);

		const ar = 800 / 600;
		const tanHalfHFOV = Math.tan(ERMath.toRadians(70 / 2));
		const tanHalfVFOV = Math.tan(ERMath.toRadians((70 * ar) / 2));

		const cascadeEnd = [];
		cascadeEnd[0] = 0.1;
		(cascadeEnd[1] = 25), (cascadeEnd[2] = 90), (cascadeEnd[3] = 30.0);

		const i = 0;
		const xn = cascadeEnd[i] * tanHalfHFOV;
		const xf = cascadeEnd[i + 1] * tanHalfHFOV;
		const yn = cascadeEnd[i] * tanHalfVFOV;
		const yf = cascadeEnd[i + 1] * tanHalfVFOV;

		// near face
		const frustumCorners = [];
		frustumCorners.push(vec4.fromValues(xn, yn, cascadeEnd[i], 1.0)),
		frustumCorners.push(vec4.fromValues(-xn, yn, cascadeEnd[i], 1.0)),
		frustumCorners.push(vec4.fromValues(xn, -yn, cascadeEnd[i], 1.0)),
		frustumCorners.push(vec4.fromValues(-xn, -yn, cascadeEnd[i], 1.0)),
		// far face
		frustumCorners.push(vec4.fromValues(xf, yf, cascadeEnd[i + 1], 1.0)),
		frustumCorners.push(vec4.fromValues(-xf, yf, cascadeEnd[i + 1], 1.0)),
		frustumCorners.push(vec4.fromValues(xf, -yf, cascadeEnd[i + 1], 1.0)),
		frustumCorners.push(vec4.fromValues(-xf, -yf, cascadeEnd[i + 1], 1.0));

		let minX = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let minY = Number.MAX_VALUE;
        let maxY = Number.MIN_VALUE;
        let minZ = Number.MAX_VALUE;
        let maxZ = Number.MIN_VALUE;

		const frustumCornersL = [];

		for (let j = 0; j < 8; j++) {
            // Transform the frustum coordinate from view to world space
			const vW = ERMath.mulMatVec(CamInv, frustumCorners[j]);

            // Transform the frustum coordinate from world to light space
            frustumCornersL.push(ERMath.mulMatVec(LightM, vW));

            minX = Math.min(minX, frustumCornersL[j][0]);
            maxX = Math.max(maxX, frustumCornersL[j][0]);
            minY = Math.min(minY, frustumCornersL[j][1]);
            maxY = Math.max(maxY, frustumCornersL[j][1]);
            minZ = Math.min(minZ, frustumCornersL[j][2]);
            maxZ = Math.max(maxZ, frustumCornersL[j][2]);
        }

		return mat4.frustum(mat4.create(), minX, maxX, minY, maxY, minZ, maxZ);
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
