// Initialize the library
ERInit();

// Define the positions, normals, and textureCoords of your model (These will generally be loaded from a file)
const positions = [-1, -1, 0, 0, 1, 0, 1, -1, 0];
const normals = [0, 0, 1, 0, 0, 1, 0, 0, 1];
const indices = [1, 0, 2];

// Create an ERObject from the model
const model = ERCreateModel(positions, normals, indices);
const ourObject = ERCreateObject(model, null, [0, 255, 0]); // no texture and a green color
ourObject.position.z = -10; // pushing the model away from the camera

// Add objects to list of objects to draw
ERObjects.push(ourObject);

// Start the animation
animate();

function animate() {
	ERDrawScene();
	requestAnimationFrame(animate);
}