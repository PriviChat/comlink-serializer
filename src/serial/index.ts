import { SerialArray, SerialMap } from '../serialobjs';
import { Serializable } from './decorators';
import { AnySerialIterable, isAnySerialIterable, SerialIterable } from './iterable';
import { SerialPrimitive } from './types';
export { lazy } from './utils';
export { default as Reviver } from './Reviver';
export { default as Serializer } from './serializer';
export { default as SerialSymbol } from './SerialSymbol';
export * from './types';

//TODO Move this to utils.ts
export function toSerialObject<T extends Serializable>(arr: Array<T>): SerialArray<T>;
export function toSerialObject<T extends Serializable, K extends SerialPrimitive>(map: Map<K, T>): SerialMap<K, T>;
export function toSerialObject<T extends Serializable, K extends SerialPrimitive>(obj: Array<T> | Map<K, T>) {
	if (obj instanceof Array) return new SerialArray(...obj);
	else return new SerialMap(obj);
}

export function toSerialIterable<T extends Serializable>(obj: AnySerialIterable<T>, channel?: MessageChannel) {
	if (obj instanceof Array || obj instanceof Map) {
		return new SerialIterable(obj, channel);
	} else if (isAnySerialIterable(obj)) {
		return new SerialIterable(obj, channel);
	} else throw new TypeError('The object passed to makeSerialIterable does not have an iterator.');
}
