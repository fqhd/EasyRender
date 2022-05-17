function main(){
	ERInit();
	const positions = [
		0, 0, 0,
		0, 1, 0,
		1, 1, 0
	];
	const normals = [
		0, 0, 1,
		0, 0, 1,
		0, 0, 1
	];
	const uvs = [
		0, 0,
		1, 0,
		1, 1
	];

	const m = ERCreateModel(positions, normals, uvs);
	ERInitScene([m]);
	ERBeginRenderLoop();
}
main();