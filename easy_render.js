let gl;

function ERInit() {
	if (initWebGL() == -1) {
		return;
	}
	initGLState();
}

function initWebGL() {
	const canvas = document.getElementById("ERCanvas");
	gl = canvas.getContext("WebGL");
	if (gl === null) {
		alert(
			"Unable to initialize WebGL. Your browser or machine may not support it."
		);
		return -1;
	}
	return 1;
}

function initGLState() {
	gl.clearColor(0, 0, 0, 0);
}
