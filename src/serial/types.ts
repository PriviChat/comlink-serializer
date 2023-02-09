import * as Comlink from 'comlink';
import {
	SerialClassToken,
	SerializedMeta,
	Serializable,
	SerializableObject,
	SerializePropertyDescriptor,
} from './decorators';
import SerialArray from './serial-array';
import SerialMap from './serial-map';
import SerialProxy from './serial-proxy';
import SerialSymbol from './serial-symbol';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = void> = new (...input: any[]) => T;

/**
 * A serialized form of a Serializable object
 *
 * @interface Serialized
 * @field {SerializedMeta}
 */
export interface Serialized {
	readonly [SerialSymbol.serialized]: SerializedMeta;
	readonly [SerialSymbol.transferables]: Array<Transferable>;
}

export type SerializedObject<O extends Object = Object> = O & Serialized;

export interface ToSerial {
	[SerialSymbol.toSerial]: boolean;
	makeSerial<T extends Serializable>(): SerialType<T>;
}
export interface ToSerialProxy {
	[SerialSymbol.toSerialProxy]: boolean;
	makeSerialProxy<T extends Serializable>(): SerialProxy<T>;
}

export type SerialPrimitive = boolean | number | bigint | string;
const serialPrimitiveKeys = ['boolean', 'number', 'bigint', 'string'] as const;
export type SerializedKeyType = typeof serialPrimitiveKeys[number];
export const serialPrimitives: Readonly<Set<string>> = new Set<string>(serialPrimitiveKeys);
export const supportedMapKeys = serialPrimitiveKeys.join(', ');

export type Dictionary<T> = {
	[key: string]: T;
};

export interface SerializedCacheEntry {
	obj: Serializable;
	serialObj: Serialized;
}

export interface SerializeCtx {
	serialize<S extends Serialized>(obj: Serializable, parentRef?: ParentRef): S;
	parentRef?: ParentRef;
}

export type SerialType<T extends Serializable> = T | SerialArray<T> | SerialMap<SerialPrimitive, T>;
export type ReviveType<T extends Serializable = Serializable> =
	| T
	| Comlink.Remote<SerializableObject<T>>
	| Array<T>
	| Map<SerialPrimitive, T>
	| IteratorResult<T | [SerialPrimitive, T]>;
export type ExtractRevive<RT> = RT extends ReviveType<infer T> ? T : never;

export interface ReviverCtx {
	revive<T extends Serializable>(serialObj: Serialized): ReviveType<T>;
	parentRef?: ParentRef;
}

export interface ParentRef {
	parent: Readonly<Serializable>;
	classToken: Readonly<SerialClassToken>;
	prop: Readonly<string>;
}

export interface SerializedProxy {
	id: string;
	proxyClass: string;
	proxyDescr: Dictionary<SerializePropertyDescriptor>;
	proxyProp?: string;
	refClass?: string;
}

export interface SerializedArray<O extends Object = Object, S extends SerializedObject<O> = SerializedObject<O>> {
	id: string;
	'ComSer.array': S[];
}

export interface SerializedMap<O extends Object = Object, S extends SerializedObject<O> = SerializedObject<O>> {
	id: string;
	'ComSer.size': number;
	'ComSer.keyType'?: SerializedKeyType;
	'ComSer.map': Array<[key: string, value: S]>;
}
