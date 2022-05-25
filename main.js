async function main() {
	// Initialize the library
	ERInit();

	const { positions, normals, indices, textureCoords } = await ERLoadModel(
		"./model.obj"
	);

	const model = ERCreateModel(positions, normals, indices, textureCoords);
	const texture = await ERLoadTexture("./bricks.png");
	const ourObject = ERCreateObject(model, texture);

	// Make a list of the objects you would like to draw
	ERObjects.push(ourObject);

	ERCamera.position.z = -10;

	// Start the render loop
	beginRenderLoop();
}

function beginRenderLoop() {
	ERObjects[0].rotation.x += 1;
	ERObjects[0].rotation.z += 1;
	ERDrawScene();
	requestAnimationFrame(beginRenderLoop);
}

main();
