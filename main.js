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
	const ourObject = ERCreateObject(model, texture);
	ourObject.reflectivity = 0.4;
	ourObject.shininess = 50;
	const ourObject2 = ERCreateObject(plane);

	// Add the objects you want to draw to the global ERObjects array
	ERObjects.push(ourObject);
	ERObjects.push(ourObject2);

	// Move the camera outside the object
	ERCamera.position.z = -5;
	ERCamera.position.y = 6;
	ERCamera.pitch = -30;
	ourObject2.scale.x = 100;
	ourObject2.scale.z = 100;

	// Start the render loop
	beginRenderLoop();
}

function beginRenderLoop() {
	ERObjects[0].rotation.x += 1;
	
	ERDrawScene();
	requestAnimationFrame(beginRenderLoop);
}

main();
