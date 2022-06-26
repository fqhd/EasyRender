export interface Vector {
	x: number;
	y: number;
	z: number;
}

export interface ModelData {
	positions: number[];
	normals: number[];
	textureCoords: number[];
	indices: number[];
}

export enum TextureType {
	Specular,
	Abledo,
	Normal
}

export interface RawData {
	positions: number[];
	normals: number[];
	textureCoords: number[];
}

export interface ERTexture {
	albedo: WebGLTexture;
	normal: WebGLTexture;
	specular: WebGLTexture;
}

export interface ERBuffer {
	posBuff: WebGLBuffer | null;
	normBuff: WebGLBuffer | null;
	indexBuff: WebGLBuffer | null;
	uvBuff: WebGLBuffer | null;
}

export interface ERModel {
	buffers: ERBuffer;
	numPositions: number;
}

export interface ERObject {
	model: ERModel;
	texture: ERTexture;
	position: Vector;
	rotation: Vector;
	scale: Vector;
}