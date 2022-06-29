import EasyRender from "../src/EasyRender.js";

const renderer = new EasyRender("ERCanvas");

async function init(){
	const texture = await renderer.assetmanager.getTexture("./res/brick_texture.jpg");
	const model = await renderer.objloader.loadModel("./res/cube.obj");
	const object = renderer.createObject(model, texture);
	renderer.add(object);
	renderer.camera.position.z += 10;
}
	
function animate() {
	renderer.drawScene();
	requestAnimationFrame(animate);
}

init().then(() => {
	requestAnimationFrame(animate);
});
