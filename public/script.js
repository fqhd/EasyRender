import EasyRender from "../src/EasyRender.js";

const renderer = new EasyRender("ERCanvas");

async function init(){
	// const texture = await renderer.assetmanager.getTexture("./res/brick_texture.jpg");
	const model = await renderer.objloader.loadModel("./res/cube.obj");
	const object = renderer.createObject(model);
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
