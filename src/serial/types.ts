import { Serializable } from './mixin';

export interface Deserializable {
	_SCLASS: string;
	deserialize(data: Serialized): Serializable;
	name: string;
}

export interface Serialized {
	_SCLASS: string;
}
