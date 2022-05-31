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

// Define the positions, normals, and textureCoords of your model (These will generally be loaded from a file)
const positions = [-1, -1, 0, 0, 1, 0, 1, -1, 0];
const normals = [0, 0, 1, 0, 0, 1, 0, 0, 1];
const indices = [1, 0, 2];

// Create an ERObject from the model
const model = ERCreateModel(positions, normals, indices);
const ourObject = ERCreateObject(model, null, [0, 255, 0]); // no texture and a green color
ourObject.position.z = 10; // pushing the model away from the camera

// Add objects to list of objects to draw
ERObjects.push(ourObject);

// Start the animation
animate();

function animate() {
	ERDrawScene();
	requestAnimationFrame(animate);
}
```

### Documentation

`ERCamGetPos(): void` returns camera position

`ERCamSetPos(x, y, z): void` sets camera position

`ERCamLookAt(x, y, z): void` updates the camera's view direction

`ERCamSetFOV(fov): void` updates the camera's field of view(in degrees)

`ERLoadModel(url): Promise` loads a model from a url(must be in .obj format). Returns a promise that resolves to an object containing raw mesh data.

`ERCreateModel(positions, normals, indices, textureCoords?, tangents?): Model` Creates a model based on the parameters provided.

`ERLoadTexture(url): Promise` loads a texture from a url(must be .png). Returns a promise that resolves into texture object

`ERCreateTexture(textureData, width, height): Texture` Creates a texture from an array of data.
