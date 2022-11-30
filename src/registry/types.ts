import { Serialized } from '../serial';
import { Serializable } from '../serial/mixin';

export interface ObjectRegistryEntry {
	name: string;
	$SCLASS: string;
	deserialize(data: Serialized): Serializable;
}
