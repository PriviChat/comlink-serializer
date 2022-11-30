import { Serializable, Serialized } from '../serial';

export interface ObjectRegistryEntry {
	name: string;
	$SCLASS: string;
	deserialize(data: Serialized): Serializable;
}
