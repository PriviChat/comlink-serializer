import { Serialized, SerialPrimitive } from '../serial';

export interface SerializedArray<S extends Serialized = Serialized> extends Serialized {
	$array: S[];
}

export type SerializedMapKeyType = 'boolean' | 'number' | 'bigint' | 'string';
export interface SerializedMap<S extends Serialized = Serialized> extends Serialized {
	$size: number;
	$keyType?: SerializedMapKeyType;
	$map: Array<[key: string, value: S]>;
}
