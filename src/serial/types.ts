import * as Comlink from 'comlink';
import {
	SerialClassToken,
	SerializedMeta,
	Serializable,
	SerializableObject,
	SerializePropertyDescriptor,
} from './decorators';
import SerialArray from './serial-array';
import SerialSet from './serial-set';
import SerialMap from './serial-map';
import SerialProxy from './serial-proxy';
import SerialSymbol from './serial-symbol';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = void> = new (...input: any[]) => T;

/**
 * All serialized objects get wrapped in a Serialized
 * interface by the {Serializer}
 * @interface Serialized
 * @field {SerializedMeta} - contains meta information about the serialized object
 * @field {Array<Transferable>} - all Transferable objects associated with the Serialized object
 */
export interface Serialized {
	readonly [SerialSymbol.serialized]: SerializedMeta;
	readonly [SerialSymbol.transferables]: Array<Transferable>;
}

/**
 * This type represents the combination of an {Object} and {Serialized}
 * @type SerializedObject
 */
export type SerializedObject<O extends Object = Object> = O & Serialized;

/**
 * When an object is passed to toSerial it gets wrapped in a proxy that
 * has these fields.
 * @interface ToSerial
 * @field {boolean} - symbol to indicate the object is toSerial
 * @function {SerialType<T>} - makeSerial - converts the object to a SerialType.
 */
export interface ToSerial {
	[SerialSymbol.toSerial]: boolean;
	makeSerial<T extends Serializable>(): SerialType<T>;
}

/**
 * When an object is passed to toSerialProxy it gets wrapped in a proxy that
 * has these fields.
 * @interface ToSerialProxy
 * @field {boolean} - symbol to indicate the object is toSerial
 * @field {SerialProxy<T>} - makeSerialProxy - converts the object to a SerialProxy
 */
export interface ToSerialProxy {
	[SerialSymbol.toSerialProxy]: boolean;
	makeSerialProxy<T extends Serializable>(): SerialProxy<T>;
}

export type SerialPrimitive = boolean | number | bigint | string;
const serialPrimitiveKeys = ['boolean', 'number', 'bigint', 'string'] as const;
export type SerializedKeyType = typeof serialPrimitiveKeys[number];
export const serialPrimitives: Readonly<Set<string>> = new Set<string>(serialPrimitiveKeys);
export const supportedMapKeys = serialPrimitiveKeys.join(', ');

/* Used for holiding the descriptor from Serialize decorator (and possibly more uses) */
export type Dictionary<T> = {
	[key: string]: T;
};

/* Used by the default Serializer */
export interface SerializedCacheEntry {
	obj: Serializable;
	serialObj: Serialized;
}

export interface SerializeCtx {
	serialize<S extends Serialized>(obj: Serializable, parentRef?: ParentRef): S;
	parentRef?: ParentRef;
}

export type SerialType<T extends Serializable> = T | SerialArray<T> | SerialSet<T> | SerialMap<SerialPrimitive, T>;
export type ReviveType<T extends Serializable = Serializable> =
	| T
	| Comlink.Remote<SerializableObject<T>>
	| Array<T>
	| Set<T>
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

/* Serialized form of a SerialProxy */
export interface SerializedProxy {
	id: string;
	proxyClass: string;
	proxyDescr: Dictionary<SerializePropertyDescriptor>;
	proxyProp?: string;
	refClass?: string;
}

/* Serialized form of a SerialArray */
export interface SerializedArray<O extends Object = Object, S extends SerializedObject<O> = SerializedObject<O>> {
	id: string;
	'ComSer.array': S[];
}

/* Serialized form of a SerialSet */
export interface SerializedSet<O extends Object = Object, S extends SerializedObject<O> = SerializedObject<O>> {
	id: string;
	'ComSer.set': S[];
}

/* Serialized form of a SerialMap */
export interface SerializedMap<O extends Object = Object, S extends SerializedObject<O> = SerializedObject<O>> {
	id: string;
	'ComSer.size': number;
	'ComSer.keyType'?: SerializedKeyType;
	'ComSer.map': Array<[key: string, value: S]>;
}
