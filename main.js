function getPlane() {
	const positions = [-1, 0, -1, -1, 0, 1, 1, 0, 1, 1, 0, -1];
	const indices = [0, 1, 2, 0, 2, 3];
	const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
	const model = ERCreateModel(positions, normals, indices);
	return model;
}

let cube;

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
	const floor = ERCreateObject(plane, null, [0, 255, 0]);
	cube = ERCreateObject(model, texture);

	cube.position.y = 1;
	cube.position.z = 10;

	ERAddObject(cube);
	ERAddObject(floor);

	// Move the camera outside the object
	floor.scale.x = 4500;
	floor.scale.z = 4500;

	// Start the render loop
	animate();
}

function animate() {
	// cube.rotation.x += 1;
	// cube.rotation.y += 1;
	// ERSetCamPos(cube.position.x, cube.position.z - 10)

	ERDrawScene();
	requestAnimationFrame(animate);
}

main();
