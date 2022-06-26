import { mat4, vec3 } from "gl-matrix";

class Shader {
	protected _program: any;
	private _uniformLocations: Map<string, WebGLUniformLocation>;
	private _attribLocations: Map<string, number>;
	constructor(private _gl: WebGLRenderingContext, vSource: string, fSource: string){
		this._uniformLocations = new Map<string, WebGLUniformLocation>;
		this._program = _gl.createProgram();
		const vs: any = this.createShaderComponent(_gl.VERTEX_SHADER, vSource);
		const fs: any = this.createShaderComponent(_gl.FRAGMENT_SHADER, fSource);
		_gl.attachShader(this._program, vs);
		_gl.attachShader(this._program, fs);
		_gl.linkProgram(this._program);
		if (!_gl.getProgramParameter(this._program, _gl.LINK_STATUS)) {
			console.error("Failed to link program");
		}
	}

	private createShaderComponent(type: number, source: string) {
		const shader: any = this._gl.createShader(type);
		this._gl.shaderSource(shader, source);
		this._gl.compileShader(shader);
		if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
			if (type == this._gl.VERTEX_SHADER) {
				console.error("Failed to compile vertex shader");
			} else {
				console.error("Failed to compile fragment shader");
			}
		}
		return shader;
	}

	private getUniformLocation(name: string){
		if(this._uniformLocations[name]){
			return this._uniformLocations[name];
		}
		return this._uniformLocations[name] = this._gl.getUniformLocation(this._program, name);
	}

	public getAttribLocation(name: string){
		if(this._attribLocations[name]){
			return this._attribLocations[name];
		}
		return this._attribLocations[name] = this._gl.getAttribLocation(this._program, name);
	}

	public setMat4(name: string, value: mat4){
		const loc = this.getUniformLocation(name);
		this._gl.uniformMatrix4fv(loc, false, value);
	}

	public setVec3(name: string, value: vec3){
		const loc = this.getUniformLocation(name);
		this._gl.uniform3fv(loc, value);
	}

	public setFloat(name: string, value: number){
		const loc = this.getUniformLocation(name);
		this._gl.uniform1f(loc, value);
	}

	public setInt(name: string, value: number){
		const loc = this.getUniformLocation(name);
		this._gl.uniform1i(loc, value);
	}

	public bind(){
		this._gl.useProgram(this._program);
	}

}

export default Shader;