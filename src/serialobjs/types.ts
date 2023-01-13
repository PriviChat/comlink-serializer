import { Serialized, SerialSymbol } from '../serial';

export interface SerializedProxy extends Serialized {
	[SerialSymbol.serializedProxy]: true;
	id: string;
	port: MessagePort;
	proxyClass: string;
	proxyProp: string;
	outerClass: string;
}

export interface SerializedArray<S extends Serialized = Serialized> extends Serialized {
	$array: S[];
}

export type SerializedMapKeyType = 'boolean' | 'number' | 'bigint' | 'string';
export interface SerializedMap<S extends Serialized = Serialized> extends Serialized {
	$size: number;
	$keyType?: SerializedMapKeyType;
	$map: Array<[key: string, value: S]>;
}
