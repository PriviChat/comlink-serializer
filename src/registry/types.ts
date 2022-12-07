import Serializable, { Serialized } from '../serial/mixin';

export interface ObjectRegistryEntry {
	name: string;
	$SCLASS: string;
	deserialize(data: Serialized): Serializable;
}
