import EasyRender from "../src/EasyRender.js";

const renderer = new EasyRender("ERCanvas");

async function init(){
	const cube = await renderer.loadObject("./res/cube");
	const sphere = await renderer.loadObject("./res/sphere");
	await renderer.loadShaders(renderer.gl);
	renderer.add(cube);
	renderer.add(sphere);
	sphere.position.x += 4;
	cube.position.x -= 4;
	sphere.scale.x = 1.5;
	sphere.scale.y = 1.5;
	sphere.scale.z = 1.5;
	renderer.camera.position.z = -10;
	renderer.camera.position.y = 10;
	renderer.camera.pitch = -30;
}

function animate() {
	renderer.drawScene();
	requestAnimationFrame(animate);
}

init().then(() => {
	requestAnimationFrame(animate);
});
