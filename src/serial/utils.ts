import { v5 as uuidv5 } from 'uuid';
import stringHash from 'string-hash';
import {
	Dictionary,
	SerializedArray,
	SerializedMap,
	SerializedProxy,
	SerialPrimitive,
	serialPrimitives,
	SerialType,
	ToSerial,
	ToSerialProxy,
} from './types';
import {
	Revivable,
	SerialClassToken,
	Serializable,
	SerializedMeta,
	SerializedObjHash,
	SerializedObjKey,
} from './decorators';
import SerialSymbol from './serial-symbol';
import SerialArray from './serial-array';
import SerialMap from './serial-map';
import { isSerializable, isSerialized } from './decorators/utils';
import SerialProxy from './serial-proxy';

/**
 * If the type of the value is a `SerialPrimitive` type, return true, otherwise return false.
 * @param {any} val - any - The value to check.
 * @returns A boolean.
 */
export function isSerialPrimitive(val: any): val is SerialPrimitive {
	const valType = typeof val;
	return serialPrimitives.has(valType.valueOf());
}

/**
 * If the object has a `toSerial` property, return true, otherwise return false.
 * @param {any} obj - any - The object to check.
 * @returns A function that takes an object and returns a boolean.
 */

export function isToSerial(obj: any): obj is ToSerial {
	if (!obj) return false;
	return obj[SerialSymbol.toSerial] ?? false;
}

/**
 * If the object has a `toSerialProxy` property, return true, otherwise return false.
 * @param {any} obj - any - The object to check.
 * @returns A function that takes an object and returns a boolean.
 */
export function isToSerialProxy(obj: any): obj is ToSerialProxy {
	if (!obj) return false;
	return obj[SerialSymbol.toSerialProxy] ?? false;
}

/**
 * It checks if the object is an instance of SerialProxy.
 * @param {any} obj - any - the object to check
 * @returns A function that takes an object and returns a boolean.
 */

export function isSerialProxy(obj: any): obj is SerialProxy<Serializable> {
	return obj instanceof SerialProxy;
}

/**
 * If the object is serialized, and the class token is the same as the class token for SerialProxy,
 * then the object is a SerializedProxy.
 * @param {any} obj - any - The object to check
 * @returns A boolean.
 */
export function isSerializedProxy(obj: any): obj is SerializedProxy {
	if (!isSerialized(obj)) return false;
	const { classToken } = obj[SerialSymbol.serialized];
	return classToken === SerialProxy.classToken.toString();
}

/**
 * If the object is serialized, and the class token is the same as the class token for SerialArray,
 * then the object is a SerializedArray.
 * @param {any} obj - any - The object to check.
 * @returns A boolean.
 */
export function isSerializedArray(obj: any): obj is SerializedArray {
	if (!isSerialized(obj)) return false;
	const { classToken } = obj[SerialSymbol.serialized];
	return classToken === SerialArray.classToken.toString();
}

/**
 * If the object is serialized, and the class token is the same as the class token for SerialMap,
 * then the object is a SerializedMap.
 * @param {any} obj - any - The object to check
 * @returns A boolean.
 */
export function isSerializedMap(obj: any): obj is SerializedMap {
	if (!isSerialized(obj)) return false;
	const { classToken } = obj[SerialSymbol.serialized];
	return classToken === SerialMap.classToken.toString();
}

/**
 *	Flags an Array<T> as an object that should be serialized
 *	@param arr - Array<T>
 *  @returns An Array<T>
 **/
export function toSerial<T extends Serializable>(arr: Array<T>): Array<T>;
/**
 *	Flags a Map<K, T> as an object that should be serialized
 *	@param arr - Map<K, T>
 *  @returns An Map<K, T>
 **/
export function toSerial<T extends Serializable, K extends SerialPrimitive>(map: Map<K, T>): Map<K, T>;
export function toSerial<T extends Serializable, K extends SerialPrimitive>(target: Array<T> | Map<K, T>) {
	return new Proxy(target, {
		get(_target, prop, receiver) {
			if (typeof prop === 'symbol' && prop === SerialSymbol.toSerial) return true;
			else if (typeof prop === 'string' && prop === 'makeSerial') return () => makeSerial(_target);
			else return Reflect.get(_target, prop, receiver);
		},
		getPrototypeOf(_target) {
			return _target;
		},
	});
}

export function makeSerial<T extends Serializable, K extends SerialPrimitive = SerialPrimitive>(
	obj: T | Array<T> | Map<K, T>
): SerialType<T> {
	if (obj instanceof Array) {
		return SerialArray.from<T>(obj);
	} else if (obj instanceof Map) {
		return SerialMap.from<K, T>(obj);
	} else {
		return obj;
	}
}

export function makeSerialProxy<T extends Serializable>(obj: T): SerialProxy<T> {
	if (obj instanceof SerialProxy) return obj;
	else return new SerialProxy<T>(obj);
}

/**
 *	Indicates that a Serializable object should be sent as a proxy.
 *	This will cause a proxy of T to be sent.
 *	@param serial - T
 *   @returns T
 **/
export function toSerialProxy<T extends Serializable>(serial: T) {
	if (!isSerializable(serial)) {
		const err = `ERR_NOT_SERIALIZABLE: Object: ${JSON.stringify(
			serial
		)} is not serializable. All serializable objects must be decoratorated with @Serializable.`;
		console.error(err);
		throw new TypeError(err);
	}
	return new Proxy(serial, {
		get(_target, prop, receiver) {
			if (typeof prop === 'symbol' && prop === SerialSymbol.toSerialProxy) return true;
			else if (typeof prop === 'string' && prop === 'makeSerialProxy') return () => makeSerialProxy(_target);
			else return Reflect.get(_target, prop, receiver);
		},
		getPrototypeOf(_target) {
			return _target;
		},
	});
}

/**
 * It takes a string and returns a return a number between 0 and 4294967295 (inclusive)
 * @param {string} str - The string to hash.
 * @returns A hash code for the string.
 */
export function hashCd(str: string): number {
	return stringHash(str);
}

/**
 * If the length of the array of keys in the dictionary is zero, then the dictionary is empty.
 * @param dict - The dictionary to check.
 * @returns A function that takes a dictionary and returns a boolean.
 */
export function isDictionaryEmpty(dict: Dictionary<any>) {
	return Object.keys(dict).length === 0;
}

/**
 * It takes a hash code and a class token and returns a unique identifier for the object
 * @param {number} hashCode - This is the hash code of the object. If -1 is passed then
 * a UTC timestamp will be used to generate the hash.
 * @param {SerialClassToken} classToken - This is a unique identifier for the class.
 * @returns A function that takes in a hashCode and a classToken and returns a string.
 */
export function serializedObjHash(hashCode: number, classToken: SerialClassToken): SerializedObjHash {
	const namespace = uuidv5('SerialClassToken', strToIntArr(classToken.toString()));
	const name = hashCode > -1 ? hashCode.toString() : Date.now().toString();
	return uuidv5(name, namespace);
}

/**
 * It takes a string, hashes it, and returns an array of 16 bytes
 * @param {string} str - The string to be hashed.
 * @returns An array of 16 numbers, each of which is a hexadecimal digit.
 */
function strToIntArr(str: string) {
	const hash = hashCd(str).toString();
	const bytes = new Array<number>(16).fill(0);
	[...hash].forEach((val, idx) => {
		bytes[idx] = parseInt(val, 16);
	});

	return bytes;
}

/**
 * > It takes a serialized object's metadata and returns a string that uniquely identifies the object
 * @param {SerializedMeta} serialMeta - SerializedMeta - This is the serialized meta data that is
 * generated by the serializer.
 * @returns {SerializedObjKey}
 */
export function serializedObjKey(serialMeta: SerializedMeta): SerializedObjKey {
	return '[' + serialMeta.classToken + ']-[' + serialMeta.hash + ']';
}
/**
 * It updates the revived function on the prototype of the object passed in to return true
 * @param {Revivable} obj - The object to mark as revived.
 */
export function markObjRevived(obj: Revivable) {
	const so = obj.constructor.prototype;
	if (typeof so[SerialSymbol.revived] !== 'function') {
		const err = `ERR_NO_REVIVED_PROP: Obj: ${JSON.stringify(
			obj
		)} passed to markObjRevived is missing prop ${SerialSymbol.revived.toString()}.`;
	}
	so[SerialSymbol.revived] = () => {
		return true;
	};
}
