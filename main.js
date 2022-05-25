let objects;

async function main() {
	// Initialize the library
	ERInit();

	const { positions, normals, indices, textureCoords } = await ERLoadModel(
		"./model.obj"
	);
	console.log(positions);
	console.log(normals);
	console.log(indices);
	console.log(textureCoords);

	const model = ERCreateModel(positions, normals, indices, textureCoords);
	const texture = await ERLoadTexture("./bricks.png");
	const ourObject = ERCreateObject(model, texture);

	// Make a list of the objects you would like to draw
	objects = [ourObject];

	// Tell EasyRender about the objects you would like to render
	ERInitScene(objects);

	// Start the render loop
	beginRenderLoop();
}

function beginRenderLoop() {
	objects[0].rotation.x += 1;
	objects[0].rotation.z += 1;
	ERDrawScene();
	requestAnimationFrame(beginRenderLoop);
}

main();
