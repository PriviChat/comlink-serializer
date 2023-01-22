import stringHash from 'string-hash';
import { Dictionary, SerialPrimitive, serialPrimitives, SerialType } from './types';
import { Serializable } from './decorators';
import SerialSymbol from './serial-symbol';
import SerialArray from './serial-array';
import SerialMap from './serial-map';
import { isSerializable } from './decorators/utils';

export function isSerialPrimitive(val: any): val is SerialPrimitive {
	const valType = typeof val;
	return serialPrimitives.has(valType.valueOf());
}

export function serialize<T extends Serializable>(arr: Array<T>): Array<T>;
export function serialize<T extends Serializable, K extends SerialPrimitive>(map: Map<K, T>): Map<K, T>;
export function serialize<T extends Serializable, K extends SerialPrimitive>(target: Array<T> | Map<K, T>) {
	return new Proxy(target, {
		get(_target, prop, receiver) {
			if (typeof prop === 'symbol' && prop === SerialSymbol.serial) return true;
			else return Reflect.get(target, prop, receiver);
		},
		getPrototypeOf(target) {
			return target;
		},
	});
}

export function serializeLazy<T extends Serializable>(arr: Array<T>): Array<T>;
export function serializeLazy<T extends Serializable, K extends SerialPrimitive>(map: Map<K, T>): Map<K, T>;
export function serializeLazy<T extends Serializable, K extends SerialPrimitive>(target: Array<T> | Map<K, T> | T) {
	return new Proxy(target, {
		get(target, prop, receiver) {
			if (typeof prop === 'symbol' && prop === SerialSymbol.serialLazy) return true;
			else return Reflect.get(target, prop, receiver);
		},
		getPrototypeOf(target) {
			return target;
		},
	});
}

export function toSerializable<ST extends SerialType>(obj: any): ST {
	//remove the proxy
	if (obj[SerialSymbol.serial]) {
		obj = Object.getPrototypeOf(obj);
	}
	if (obj instanceof Array) {
		return SerialArray.from(obj) as ST;
	} else if (obj instanceof Map) {
		return SerialMap.from(obj) as ST;
	} else if (isSerializable(obj)) {
		return obj as ST;
	} else {
		const err = `ERR_NOT_SERIALIZABLE: Object: ${JSON.stringify(
			obj
		)} is not serializable. All serializable objects must be decoratorated with @Serializable.`;
		console.error(err);
		throw new TypeError(err);
	}
}

export function hashCd(str: string): number {
	return stringHash(str);
}

export function isDictionaryEmpty(dict: Dictionary<any>) {
	return Object.keys(dict).length === 0;
}
