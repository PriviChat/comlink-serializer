import { Serialized } from '../serial';

export interface SerializedArray extends Serialized {
	_array: Serialized[];
}

export interface SerializedMap extends Serialized {
	_map: Map<boolean | number | bigint | string, Serialized>;
}
