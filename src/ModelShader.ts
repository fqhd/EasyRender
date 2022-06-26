import Shader from "./Shader.js";

class ModelShader extends Shader {
	constructor(_gl: WebGLRenderingContext) {
		const vSource = `
			attribute vec3 aPosition;
			attribute vec3 aNormal;
			attribute vec2 aUV;

			varying vec3 vNormal;
			varying vec3 vLightDir;
			varying vec2 vUV;
			varying vec3 vToCamVec;
			varying vec3 vFragPos;

			uniform mat4 projection;
			uniform mat4 view;
			uniform mat4 model;
			uniform vec3 camPos;

			const vec3 lightDir = vec3(0.0, -1.0, -1.0);

			void main(){
				vec4 worldPos = model * vec4(aPosition, 1.0);
				gl_Position = projection * view * worldPos;

				vUV = aUV;
				vNormal = (model * vec4(aNormal, 0.0)).xyz;
				
				vToCamVec = camPos - worldPos.xyz;
				vLightDir = lightDir;
				vToCamVec = camPos - worldPos.xyz;
			}`;
		const fSource = `
			varying mediump vec3 vNormal;
			varying mediump vec2 vUV;
			varying mediump vec3 vToCamVec;
			varying mediump vec3 vLightDir;

			uniform mediump vec3 objColor;
			uniform sampler2D uTexture;
			uniform sampler2D shadowMap;

			const mediump float shininess = 2.0;
			const mediump float reflectivity = 0.3;

			void main(){
				mediump vec3 fragColor;
				mediump vec3 fragColor = texture2D(uTexture, vUV).rgb;

				mediump vec3 unitLightDir = normalize(vLightDir);
				mediump vec3 unitNormal = normalize(vNormal);

				mediump vec3 unitToCamVec = normalize(vToCamVec);

				// Diffuse calculation
				mediump float brightness = dot(-unitLightDir, unitNormal);
				brightness = max(brightness, 0.3);

				// Specular Calculation
				mediump vec3 reflected = reflect(unitLightDir, unitNormal);
				mediump float specFactor = dot(reflected, unitToCamVec);
				specFactor = max(specFactor, 0.0);
				specFactor = pow(specFactor, shininess);
				mediump vec3 finalSpec = vec3(1.0) * reflectivity * specFactor;

				gl_FragColor = vec4(fragColor * brightness + finalSpec, 1.0);
			}`;
		super(_gl, vSource, fSource);
		this.bind();
		this.setInt("uTexture", 0);
		this.setInt("shadowMap", 1);
	}
}

export default ModelShader;