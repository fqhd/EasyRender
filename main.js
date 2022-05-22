// Initialize the library
ERInit();

// Define the positions, normals, and textureCoords of your model (These will generally be loaded from a file)
const positions = [
	0, 0, 0,
	0.5, 1, 0,
	1, 0, 0
];
const normals = [
	0, 0, -1,
	0, 0, -1,
	0, 0, -1
];
const indices = [
	0, 1, 2
];

const model = ERCreateModel(positions, normals, indices);
const ourObject = ERCreateObject(model);

// Make a list of the objects you would like to draw
const objects = [ourObject];

// Tell EasyRender about the objects you would like to render
ERInitScene(objects);

// Start the render loop
ERBeginRenderLoop();
console.log(ourObject);
