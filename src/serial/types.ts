import { SerialClassToken, SerialMeta, Serializable } from './decorators';
import SerialArray from './serial-array';
import SerialMap from './serial-map';
import SerialProxy from './serial-proxy';
import SerialSymbol from './serial-symbol';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = void> = new (...input: any[]) => T;

export interface Serialized {
	[SerialSymbol.serialized]?: SerialMeta;
}

export type SerialPrimitive = boolean | number | bigint | string;
const serialPrimitiveKeys = ['boolean', 'number', 'bigint', 'string'] as const;
export type SerializedMapKeyType = typeof serialPrimitiveKeys[number];
export const serialPrimitives: Readonly<Set<string>> = new Set<string>(serialPrimitiveKeys);
export const supportedMapKeys = serialPrimitiveKeys.join(', ');

export type Dictionary<T> = {
	[key: string]: T;
};

export interface SerializeCtx {
	serialize<S extends Serialized>(obj: Serializable, parentRef?: ParentRef): S;
	parentRef?: ParentRef;
}

export type SerialType<T extends Serializable = Serializable> = T | SerialArray<T> | SerialMap<SerialPrimitive, T>;
export type ReviveType<T extends Serializable = Serializable> = T | SerialProxy<T> | Array<T> | Map<SerialPrimitive, T>;

export interface ReviverCtx {
	revive<T extends Serializable>(serialObj: Serialized): ReviveType<T>;
	parentRef?: ParentRef;
}

export interface ParentRef {
	parent: Readonly<Serializable>;
	classToken: Readonly<SerialClassToken>;
	prop: Readonly<string>;
}

export interface SerializedProxy extends Serialized {
	[SerialSymbol.serializedProxy]: true;
	id: string;
	port: MessagePort;
	proxyClass: string;
	proxyProp: string;
	//	proxyDescr: Dictionary<SerializeDescriptorProperty>;
	refClass: string;
}

export interface SerializedArray<S extends Serialized = Serialized> extends Serialized {
	$array: S[];
}

export interface SerializedMap<S extends Serialized = Serialized> extends Serialized {
	$size: number;
	$keyType?: SerializedMapKeyType;
	$map: Array<[key: string, value: S]>;
}
