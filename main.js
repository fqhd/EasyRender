// Initialize the library
ERInit();

// Define the positions, normals, and textureCoords of your model (These will generally be loaded from a file with ERLoadModel())
const positions = [1, 0, -1, 1, 0, 1, -1, 0, 1, -1, 0, -1];
const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
const indices = [1, 0, 2, 2, 0, 3];

// Create an ERModel
const model = ERCreateModel(positions, normals, indices);

// Create an ERObject
const obj = ERCreateObject(model, null, [240, 60, 0]); // no texture and a green color

// Move the object infront of the camera so you can seen it
obj.position.z = 10;

// Add objects to list of objects to draw
ERAddObject(obj);

// Start the animation and send your callback function
ERBeginAnimationLoop(update);

function update(deltaTime) {
	// This function will be called every frame
}