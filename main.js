function getPlane() {
	const positions = [-1, 0, -1, -1, 0, 1, 1, 0, 1, 1, 0, -1];
	const indices = [0, 1, 2, 0, 2, 3];
	const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
	const colors = [1, 0.5, 0, 1, 0, 0, 1, 0, 0, 1, 0.5, 0];
	const model = ERCreateModel(positions, normals, indices, null, colors);
	return model;
}

let cube;
let o = {};

async function main() {
	// Initialize the library
	ERInit();

	// Load the model data
	const { positions, normals, indices } = await ERLoadModel(
		"./model.obj"
	);
	const plane = getPlane();

	// Create the model object
	const model = ERCreateModel(positions, normals, indices);

	// Create ERObject
	const floor = ERCreateObject(plane, null, [0, 255, 0]);
	cube = ERCreateObject(model, null, [255, 0, 0]);
	cube.position.y = 1;
	cube.position.z = 10;

	for (let i = 0; i < 10; i++) {
		const c = ERCreateObject(model, null, [255, 0, 0]);
		c.position.y = 1;
		c.position.x = Math.random() * 60 - 30;
		c.position.z = Math.random() * 60 - 30;
		ERAddObject(c);
	}

	ERAddObject(cube);
	ERAddObject(floor);

	// Move the camera outside the object
	floor.scale.x = 30;
	floor.scale.z = 30;

	document.addEventListener("keydown", keyPressed);
	document.addEventListener("keyup", keyReleased);

	// Start the render loop
	animate();
}

function update(dt) {
	if (o["ArrowLeft"]) {
		cube.position.x += 15 * dt;
	}
	if (o["ArrowRight"]) {
		cube.position.x -= 15 * dt;
	}
	if (o["ArrowUp"]) {
		cube.position.z += 15 * dt;
	}
	if (o["ArrowDown"]) {
		cube.position.z -= 15 * dt;
	}
}

function keyReleased(k) {
	o[k.key] = false;
}

function keyPressed(k) {
	o[k.key] = true;
}

let lastTime = 0;
function animate(time) {
	const dt = (time - lastTime) / 1000;
	lastTime = time;
	// cube.rotation.x += 1;
	// cube.rotation.y += 1;
	update(dt);
	ERSetCamPos(cube.position.x, cube.position.z - 10)

	ERDrawScene();
	requestAnimationFrame(animate);
}

main();
