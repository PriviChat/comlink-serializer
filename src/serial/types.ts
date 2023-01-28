import { SerialClassToken, SerializedMeta, Serializable } from './decorators';
import SerialArray from './serial-array';
import SerialMap from './serial-map';
import SerialProxy from './serial-proxy';
import SerialSymbol from './serial-symbol';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor<T = void> = new (...input: any[]) => T;

export interface Serialized {
	[SerialSymbol.serialized]?: SerializedMeta;
}

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
export type SerializedMapKeyType = typeof serialPrimitiveKeys[number];
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
	addTransferable(transfer: Transferable): void;
	parentRef?: ParentRef;
}

export type SerialType<T extends Serializable> = T | SerialArray<T> | SerialMap<SerialPrimitive, T>;
export type ReviveType<T extends Serializable = Serializable> = T | SerialProxy<T> | Array<T> | Map<SerialPrimitive, T>;
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

export interface SerializedProxy extends Serialized {
	id: string;
	port: MessagePort;
	proxyClass: string;
	proxyProp?: string;
	refClass?: string;
}

export interface SerializedArray<S extends Serialized = Serialized> extends Serialized {
	'ComSer.array': S[];
}

export interface SerializedMap<S extends Serialized = Serialized> extends Serialized {
	'ComSer.size': number;
	'ComSer.keyType'?: SerializedMapKeyType;
	'ComSer.map': Array<[key: string, value: S]>;
}
