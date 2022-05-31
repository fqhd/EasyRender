function getPlane(){
	const positions = [
		-1, 0, -1,
		-1, 0, 1,
		1, 0, 1,
		1, 0, -1
	];
	const indices = [
		0, 1, 2,
		0, 2, 3
	];
	const normals = [
		0, 1, 0,
		0, 1, 0,
		0, 1, 0,
		0, 1, 0
	];
	const model = ERCreateModel(positions, normals, indices);
	return model;
}

async function main() {
	// Initialize the library
	ERInit();

	// Load the model data
	const { positions, normals, indices, textureCoords } = await ERLoadModel(
		"./model.obj"
	);
	const plane = getPlane();

	// Create the model object
	const model = ERCreateModel(positions, normals, indices, textureCoords);

	// Load texture
	const texture = await ERLoadTexture("./bricks_texture.jpg");

	// Create ERObjectj
	const cube = ERCreateObject(model, texture);
	const floor = ERCreateObject(plane);

	// Add the objects you want to draw to the global ERObjects array
	ERObjects.push(cube);
	ERObjects.push(floor);

	// Move the camera outside the object
	ERCamera.position.z = -5;
	ERCamera.position.y = 6;
	ERCamera.pitch = -30;
	floor.scale.x = 100;
	floor.scale.z = 100;

	// Start the render loop
	animate();
}

function animate() {
	ERObjects[0].rotation.x += 1;
	
	ERDrawScene();
	requestAnimationFrame(animate);
}

main();
