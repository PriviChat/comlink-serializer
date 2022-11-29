import { Serializable, Serialized } from '../serial';

export interface ObjectRegistryEntry {
	name: string;
	_SCLASS: string;
	deserialize(data: Serialized): Serializable;
}
