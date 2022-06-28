import EasyRender from "../src/EasyRender.js";

const renderer = new EasyRender("ERCanvas");

function animate() {
	renderer.drawScene();
	requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
