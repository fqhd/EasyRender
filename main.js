async function main() {
	// Initialize the library
	ERInit();

	// Load the model data
	const { positions, normals, indices, textureCoords } = await ERLoadModel(
		"./model.obj"
	);

	// Create the model object
	const model = ERCreateModel(positions, normals, indices, textureCoords);

	// Load texture
	const texture = await ERLoadTexture("./bricks.png");

	// Create ERObjectj
	const ourObject = ERCreateObject(model, texture, null);

	// Add the objects you want to draw to the global ERObjects array
	ERObjects.push(ourObject);

	// Move the camera outside the object
	ERCamera.position.z = -10;

	// Start the render loop
	beginRenderLoop();
}

function beginRenderLoop() {
	ERObjects[0].rotation.x += 1;
	// ERObjects[0].rotation.z += 1;
	ERDrawScene();
	requestAnimationFrame(beginRenderLoop);
}

main();
