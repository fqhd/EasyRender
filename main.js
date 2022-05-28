async function main() {
	// Initialize the library
	ERInit();

	// Load the model data
	const { positions, normals, indices, textureCoords, tangents } = await ERLoadModel(
		"./model.obj"
	);

	// Create the model object
	const model = ERCreateModel(positions, normals, indices, textureCoords, tangents);

	// Load texture
	const texture = await ERLoadTexture("./bricks_texture.jpg");
	const normalmap = await ERLoadTexture("./bricks_normal.jpg");

	// Create ERObjectj
	const ourObject = ERCreateObject(model, texture, normalmap);
	ourObject.reflectivity = 0.4;
	ourObject.shininess = 50;

	// Add the objects you want to draw to the global ERObjects array
	ERObjects.push(ourObject);

	// Move the camera outside the object
	ERCamera.position.z = -5;
	ERCamera.position.y = 6;
	ERCamera.forward.y = -0.5;

	// Start the render loop
	beginRenderLoop();
}

function beginRenderLoop() {
	ERObjects[0].rotation.x += 1;
	
	ERDrawScene();
	requestAnimationFrame(beginRenderLoop);
}

main();
