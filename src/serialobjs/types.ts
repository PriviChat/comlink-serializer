import { Serialized } from '../serial';

export interface SerializedArray<S extends Serialized = Serialized> extends Serialized {
	$array: S[];
}

export interface SerializedMap<S extends Serialized = Serialized> extends Serialized {
	$map: { [key: number | string]: Serialized };
}
