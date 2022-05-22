// Initialize the library
ERInit();

// Define the positions, normals, and textureCoords of your model (These will generally be loaded from a file)
const positions = [0, 0, 0, 0.5, 1, 0, 1, 0, 0];
const normals = [0, 0, -1, 0, 0, -1, 0, 0, -1];
const textureCoords = [0, 0, 0.5, 1, 1, 0];
const indices = [0, 1, 2];

// Define the textureData of your model(This will also generally be loaded in from a file)
const textureData = [
	0,
	0,
	255,
	255, // This will make 1 opaque blue pixel
];

const model = ERCreateModel(positions, normals, indices, textureCoords);
const texture = ERCreateTexture(textureData, 1, 1);
const ourObject = ERCreateObject(model, texture);

// Make a list of the objects you would like to draw
const objects = [ourObject];

// Tell EasyRender about the objects you would like to render
ERInitScene(objects);

// Start the render loop
ERBeginRenderLoop();
console.log(ourObject);
