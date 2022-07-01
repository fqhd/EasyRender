import EasyRender from "../src/EasyRender.js";

const renderer = new EasyRender("ERCanvas");

async function init(){
	const object = await renderer.loadObject("./res/cube");
	await renderer.loadShaders(renderer.gl);
	renderer.add(object);
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
