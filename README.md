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
const positions = [
	0, 0, 0,
	0.5, 1, 0,
	1, 0, 0,
];
const normals = [
	0, 0, -1,
	0, 0, -1,
	0, 0, -1,
];
const indices = [
	0, 1, 2
];
const textureCoords = [
	0, 0,
	0.5, 1,
	1, 0
];

// Define the textureData of your model(This will also generally be loaded in from a file)
const textureData = [
	0, 0, 255, 255 // This will make 1 opaque blue pixel
];

// Create the model and texture
const model = ERCreateModel(positions, normals, indices);
const texture = ERCreateTexture(textureData);
const ourObject = ERCreateObject(model, texture);

// Make a list of the objects you would like to draw
const objects = [ourObject];

// Tell EasyRender about the objects you would like to render
ERInitScene(objects);

// Start the render loop
ERBeginRenderLoop();
```

### Documentation

`ERCamGetPos()` returns camera position

`ERCamSetPos(x, y, z)` sets camera position

`ERCamLookAt(x, y, z)` updates the camera's view direction

`ERCamSetFOV(fov)` updates the camera's field of view(in degrees)

`ERLoadModel(url)` loads a model from a url(must be in .obj format)

`ERLoadTexture(url)` loads a texture from a url(must be .png)
