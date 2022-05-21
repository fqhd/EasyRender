function main(){
	ERInit();
	const positions = [
		0, 0, 0,
		0, 1, 0,
		1, 1, 0,
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

	const model = ERCreateModel(positions, normals, uvs);
	const object = ERCreateObject(model, null);
	ERInitScene([object]);
	ERBeginRenderLoop();
}

main();