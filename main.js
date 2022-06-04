function getPlane() {
	const positions = [-1, 0, -1, -1, 0, 1, 1, 0, 1, 1, 0, -1];
	const indices = [0, 1, 2, 0, 2, 3];
	const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
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

	// Create ERObject
	const floor = ERCreateObject(plane);
	const cube = ERCreateObject(model, texture);

	cube.scale.x = 0.5;
	cube.scale.y = 0.5;
	cube.scale.z = 0.5;
	cube.position.y = 0.5;
	cube.position.x = 20;
	cube.position.z = 15;

	ERObjects.push(cube);

	// Add the objects you want to draw to the global ERObjects array
	ERObjects.push(floor);

	// Move the camera outside the object
	floor.scale.x = 4500;
	floor.scale.z = 4500;

	// Start the render loop
	animate();
}

function animate() {
	// ERObjects[0].position.x -= 0.1;
	ERObjects[0].position.z += 0.1;
	ERCamera.x = ERObjects[0].position.x;
	ERCamera.z = ERObjects[0].position.z - 10;

	ERDrawScene();
	requestAnimationFrame(animate);
}

main();
