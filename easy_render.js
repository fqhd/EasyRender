let gl;

function ERInit() {
	const canvas = document.getElementById("ERCanvas");
	gl = canvas.getContext("WebGL");
	if (gl === null) {
		alert(
			"Unable to initialize WebGL. Your browser or machine may not support it."
		);
		return;
	}
}
