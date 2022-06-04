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

	// Create ERObject
	const cube = ERCreateObject(model, texture);
	const floor = ERCreateObject(plane);

	// Add the objects you want to draw to the global ERObjects array
	ERObjects.push(cube);
	ERObjects.push(floor);

	cube.position.y = 3;
	cube.position.x = 3;

	// Move the camera outside the object
	ERCamera.z = -30;
	ERCamera.x = 20;
	floor.scale.x = 45;
	floor.scale.z = 45;

	// Start the render loop
	animate();
}

function animate() {
	ERObjects[0].rotation.z += 1;
	ERObjects[0].rotation.x += 1;
	ERObjects[0].position.x -= 0.03;
	ERObjects[0].position.z += 0.03;

	ERDrawScene();
	requestAnimationFrame(animate);
}

main();
