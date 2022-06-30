class Shader {
	constructor(gl, vSource, fSource){
		this.gl = gl;
		this.uniformLocations = new Map();
		this.attribLocations = new Map();
		this.program = gl.createProgram();
		const vs = this.createShaderComponent(gl.VERTEX_SHADER, vSource);
		const fs = this.createShaderComponent(gl.FRAGMENT_SHADER, fSource);
		gl.attachShader(this.program, vs);
		gl.attachShader(this.program, fs);
		gl.linkProgram(this.program);
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			console.error("Failed to link program");
		}
	}

	createShaderComponent(type, source) {
		const shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			if (type == this.gl.VERTEX_SHADER) {
				console.error("Failed to compile vertex shader");
			} else {
				console.error("Failed to compile fragment shader");
			}
		}
		return shader;
	}

	getUniformLocation(name){
		return this.gl.getUniformLocation(this.program, name);
		if(this.uniformLocations[name]){
			return this.uniformLocations[name];
		}
		return this.uniformLocations[name] = this.gl.getUniformLocation(this.program, name);
	}

	getAttribLocation(name){
		if(this.attribLocations[name]){
			return this.attribLocations[name];
		}
		return this.attribLocations[name] = this.gl.getAttribLocation(this.program, name);
	}

	setMat4(name, value){
		const loc = this.getUniformLocation(name);
		this.gl.uniformMatrix4fv(loc, false, value);
	}

	setVec3(name, value){
		const loc = this.getUniformLocation(name);
		this.gl.uniform3fv(loc, value);
	}

	setFloat(name, value){
		const loc = this.getUniformLocation(name);
		this.gl.uniform1f(loc, value);
	}

	setInt(name, value){
		const loc = this.getUniformLocation(name);
		this.gl.uniform1i(loc, value);
	}

	bind(){
		this.gl.useProgram(this.program);
	}
}

export default Shader;