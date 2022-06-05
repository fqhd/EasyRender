# EasyRender

Sometimes you just want to visualize 3D objects on the web, but it can be difficult to learn graphics APIs such as webgl or three.js, I created EasyRender to fix this issue. It is a really simple library that allows you to render 3D models relatively easily. This project is aimted to cater around people who are making some 3D visualization of some sort, whether it is to load a model, work with AI, or else. Although you can make a game with this, it is not recommended as a lot of the initial graphic properties are already built in and cannot be changed without changing the source code of the project.

---

## Documentation

The library operates with functions. There are no classes, most of the development is done by calling ER functions.

### Setup

Import the `easy_renderer.js` using a `<script>` tag file before your main javascript file. Now that you have the library imported, you have to create a canvas element, give it a width and height, and an id of "ERCanvas".

```html
<canvas id="ERCanvas" width="800" height="600"></canvas>
```

### Getting Started

Here is a small example to get you started using the library.

```js
// Initialize the library
ERInit();

// Define the positions, normals, and textureCoords of your model (These will generally be loaded from a file with ERLoadModel())
const positions = [-1, -1, 0, 0, 1, 0, 1, -1, 0];
const normals = [0, 0, 1, 0, 0, 1, 0, 0, 1];
const indices = [1, 0, 2];

// Create an ERModel
const model = ERCreateModel(positions, normals, indices);

// Create an ERObject
const obj = ERCreateObject(model, null, [0, 255, 0]); // no texture and a green color

// Move the object infront of the camera so you can seen it
obj.position.z = 10;

// Add objects to list of objects to draw
ERAddObject(obj);

// Start the animation and send your callback function
ERBeginAnimationLoop(update);

function update(deltaTime) {
	// This function will be called every frame
}
```

### Documentation

`ERAddObject(object): void` Adds an object to the scene(don't call this every frame)

`ERSetCamPos(x, z): void` Sets camera position

`ERLoadModel(url): Promise` Loads a model from a url(must be in .obj format). Returns a promise that resolves to an object containing raw mesh data.

`ERCreateModel(positions, normals, indices, textureCoords?, tangents?): Model` Creates a model based on the parameters provided.

`ERLoadTexture(url): Promise` Loads a texture from a url(must be .png). Returns a promise that resolves into texture object

`ERBeginAnimationLoop(callback): void` Asynchronously starts the rendering loop and calls the callback you passed in every frame and passes in the deltaTime(in seconds) as a parameter to the callback.