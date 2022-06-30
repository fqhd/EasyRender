# EasyRender

Sometimes you just want to visualize 3D objects on the web, but it can be difficult to learn graphics APIs such as webgl or three.js, I created EasyRender to fix this issue. It is a really simple library that allows you to render 3D models relatively easily. This project is aimted to cater around people who are making some 3D visualization of some sort, whether it is to load a model, work with AI, or else. Although you can make a game with this, it is not recommended as a lot of the initial graphic properties are already built in and cannot be changed without altering the source code of the project.

---

## Documentation

The library operates with functions. There are no classes, most of the development is done by calling ER functions.

### Setup

The easiest way to start using this library is by cloning the repository and creating a `script.js` file inside the `public/` directory. You will be writing your code in the `script.js` file.

### Getting Started

Here is a small example to get you started using the library.

```js
import EasyRender from "../src/EasyRender.js";

// Initialize the renderer by passing in the ID of the HTML canvas element.
const renderer = new EasyRender("ERCanvas");

// Asynchronous function to load & setup your scene
async function init(){
	const object = renderer.loadObject("./res/car");
	renderer.add(object);
	renderer.camera.position.z = -10;
	renderer.camera.position.y = 10;
	renderer.camera.pitch = -30;
}

// Simple animation loop
function animate() {
	renderer.drawScene();
	requestAnimationFrame(animate);
}

// After initializing the scene, begin rendering
init().then(() => {
	requestAnimationFrame(animate);
});
```
